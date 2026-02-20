import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { supabaseAdmin } from '@/config/supabase.config';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';

/**
 * GET /api/auth/google/callback
 * Callback après authentification Google
 * 
 * Query params:
 * - code: Code d'autorisation retourné par Google
 * - error: Erreur éventuelle
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    // Si erreur retournée par Google
    if (error) {
      throw ApiError.badRequest(`Erreur d'authentification Google: ${error}`);
    }

    if (!code) {
      throw ApiError.badRequest('Code d\'autorisation manquant');
    }

    const authService = new SupabaseAuthService();
    const { user, session, error: exchangeError } = await authService.exchangeCodeForSession(code);

    if (exchangeError || !user || !session) {
      throw ApiError.unauthorized(exchangeError?.message || 'Erreur lors de l\'échange du code');
    }

    // Extraire les métadonnées de l'utilisateur Google
    const metadata = user.user_metadata || {};
    const appMetadata = user.app_metadata || {};
    
    // Déterminer le nom et prénom depuis Google
    const fullName = metadata.full_name || metadata.name || '';
    const nameParts = fullName.split(' ');
    const nom = metadata.nom || nameParts[nameParts.length - 1] || 'Non défini';
    const prenom = metadata.prenom || nameParts[0] || 'Non défini';
    const telephone = metadata.telephone || '';
    const typeUtilisateur = metadata.type_utilisateur || metadata.typeUtilisateur || 'LOCATAIRE';

    // Vérifier si l'utilisateur existe déjà dans notre table
    const { data: existingUser, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    // Si l'utilisateur n'existe pas, le créer
    if (dbError || !existingUser) {
      try {
        await authService.createUserInDatabase(
          user.id,
          user.email || '',
          nom,
          prenom,
          telephone,
          typeUtilisateur
        );
        logger.info(`Utilisateur Google créé: ${user.id}`);
      } catch (createError: any) {
        // Si l'utilisateur existe déjà (race condition), continuer
        if (!createError.message?.includes('duplicate') && !createError.message?.includes('already exists')) {
          logger.error('Erreur lors de la création de l\'utilisateur Google:', createError);
        }
      }
    }

    // Marquer l'email comme vérifié (Google vérifie déjà l'email)
    if (user.email_confirmed_at) {
      try {
        await authService.updateUserVerificationStatus(user.id, true);
      } catch (updateError) {
        logger.warn('Erreur lors de la mise à jour du statut de vérification:', updateError);
      }
    }

    logger.info(`Authentification Google réussie pour: ${user.email}`);

    return NextResponse.json(
      ApiResponse.success(
        {
          user: {
            id: user.id,
            email: user.email,
            nom: existingUser?.nom || nom,
            prenom: existingUser?.prenom || prenom,
            telephone: existingUser?.telephone || telephone,
            typeUtilisateur: existingUser?.type_utilisateur || typeUtilisateur,
            estVerifie: true,
          },
          session: {
            accessToken: session.access_token,
            refreshToken: session.refresh_token,
            expiresAt: session.expires_at,
            expiresIn: session.expires_in,
          },
        },
        'Authentification Google réussie'
      ),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
