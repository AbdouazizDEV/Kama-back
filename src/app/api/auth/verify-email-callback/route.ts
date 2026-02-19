import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';
import { supabase } from '@/config/supabase.config';

/**
 * Endpoint de callback pour la vérification d'email
 * Appelé depuis le frontend après la redirection Supabase
 * 
 * GET /api/auth/verify-email-callback?access_token=xxx&type=signup
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type') || 'signup';

    if (!accessToken) {
      throw ApiError.badRequest('Access token manquant');
    }

    // Vérifier le token avec Supabase
    const { data: userData, error: tokenError } = await supabase.auth.getUser(accessToken);

    if (tokenError || !userData.user) {
      throw ApiError.badRequest('Token d\'accès invalide ou expiré');
    }

    const user = userData.user;

    // Vérifier si l'email est déjà vérifié
    if (!user.email_confirmed_at) {
      throw ApiError.badRequest('L\'email n\'a pas encore été vérifié');
    }

    // Mettre à jour le statut dans notre table
    const authService = new SupabaseAuthService();
    await authService.updateUserVerificationStatus(user.id, true);

    logger.info(`Email vérifié via callback pour l'utilisateur: ${user.id}`);

    return NextResponse.json(
      ApiResponse.success(
        {
          userId: user.id,
          email: user.email,
          verified: true,
        },
        'Email vérifié avec succès'
      ),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
