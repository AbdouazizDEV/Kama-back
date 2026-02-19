import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { registerUserSchema } from '@/presentation/validators/auth.validator';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { rateLimitMiddleware } from '@/presentation/middlewares/ratelimit.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Validation
    const data = await validateRequest(request, registerUserSchema);

    // Service d'authentification
    const authService = new SupabaseAuthService();

    // Inscription via Supabase Auth
    const { user, session, error } = await authService.signUp({
      email: data.email,
      password: data.password,
      nom: data.nom,
      prenom: data.prenom,
      telephone: data.telephone,
      typeUtilisateur: data.typeUtilisateur,
    });

    if (error) {
      if (error.message.includes('already registered')) {
        throw ApiError.conflict('Cet email est déjà utilisé');
      }
      throw ApiError.badRequest(error.message);
    }

    if (!user) {
      throw ApiError.internal('Erreur lors de la création du compte');
    }

    // Créer l'utilisateur dans notre table users
    try {
      await authService.createUserInDatabase(
        user.id,
        data.email,
        data.nom,
        data.prenom,
        data.telephone,
        data.typeUtilisateur
      );
    } catch (dbError) {
      logger.error('Erreur lors de la création dans la table users:', dbError);
      // Ne pas échouer si l'utilisateur existe déjà dans Supabase Auth
    }

    logger.info(`Nouvel utilisateur créé: ${user.id}`);

    return NextResponse.json(
      ApiResponse.success(
        {
          id: user.id,
          email: user.email,
          nom: data.nom,
          prenom: data.prenom,
          typeUtilisateur: data.typeUtilisateur,
          emailVerified: user.email_confirmed_at !== null,
        },
        'Inscription réussie. Veuillez vérifier votre email.'
      ),
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
