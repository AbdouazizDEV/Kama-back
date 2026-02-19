import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { loginUserSchema } from '@/presentation/validators/auth.validator';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { rateLimitMiddleware } from '@/presentation/middlewares/ratelimit.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';
import { supabaseAdmin } from '@/config/supabase.config';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Validation
    const data = await validateRequest(request, loginUserSchema);

    // Service d'authentification
    const authService = new SupabaseAuthService();

    // Connexion via Supabase Auth
    const { user, session, error } = await authService.signIn({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        throw ApiError.unauthorized('Email ou mot de passe incorrect');
      }
      throw ApiError.unauthorized(error.message);
    }

    if (!user || !session) {
      throw ApiError.unauthorized('Erreur lors de la connexion');
    }

    // Vérifier que l'utilisateur existe dans notre table et est actif
    const { data: userData, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError || !userData) {
      logger.warn(`Utilisateur ${user.id} existe dans Auth mais pas dans la table users`);
    }

    if (userData && !userData.est_actif) {
      throw ApiError.forbidden('Votre compte a été désactivé');
    }

    if (!user.email_confirmed_at) {
      throw ApiError.forbidden('Veuillez vérifier votre email avant de vous connecter');
    }

    logger.info(`Connexion réussie: ${user.email}`);

    return NextResponse.json(
      ApiResponse.success(
        {
          user: {
            id: user.id,
            email: user.email,
            nom: userData?.nom || user.user_metadata?.nom,
            prenom: userData?.prenom || user.user_metadata?.prenom,
            typeUtilisateur: userData?.type_utilisateur || user.user_metadata?.type_utilisateur,
          },
          session: {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at,
            expiresIn: session.expires_in,
          },
        },
        'Connexion réussie'
      ),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
