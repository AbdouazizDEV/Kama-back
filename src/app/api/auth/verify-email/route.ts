import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { z } from 'zod';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';
import { supabase, supabaseAdmin } from '@/config/supabase.config';

const verifyEmailSchema = z.object({
  token: z.string().optional(), // Token OTP (ancienne méthode)
  accessToken: z.string().optional(), // Access token depuis la redirection Supabase
  type: z.enum(['email', 'signup', 'recovery']).optional().default('signup'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await validateRequest(request, verifyEmailSchema);
    const authService = new SupabaseAuthService();

    let user = null;
    let verified = false;

    // Cas 1: Vérification via access_token (redirection Supabase)
    if (data.accessToken) {
      try {
        // Décoder le JWT pour obtenir l'ID utilisateur
        const tokenParts = data.accessToken.split('.');
        if (tokenParts.length !== 3) {
          throw ApiError.badRequest('Format de token invalide');
        }

        // Décoder le payload (base64url)
        const payload = JSON.parse(
          Buffer.from(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
        );

        const userId = payload.sub;
        if (!userId) {
          throw ApiError.badRequest('Token invalide: ID utilisateur manquant');
        }

        // Vérifier l'expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          throw ApiError.badRequest('Token expiré');
        }

        // Vérifier que l'email est vérifié dans le token
        const emailVerified = payload.user_metadata?.email_verified || payload.email_verified;
        if (!emailVerified) {
          throw ApiError.badRequest('L\'email n\'a pas encore été vérifié');
        }

        // Récupérer l'utilisateur via l'API admin
        const { data: adminUser, error: adminError } = await supabaseAdmin.auth.admin.getUserById(userId);

        if (adminError || !adminUser.user) {
          logger.error('Erreur lors de la récupération de l\'utilisateur:', adminError);
          throw ApiError.badRequest(`Erreur lors de la vérification: ${adminError?.message || 'Utilisateur introuvable'}`);
        }

        user = adminUser.user;
        verified = true;

        // Mettre à jour le statut dans notre table
        try {
          await authService.updateUserVerificationStatus(user.id, true);
          logger.info(`Statut de vérification mis à jour pour l'utilisateur: ${user.id}`);
        } catch (dbError: any) {
          logger.warn(`Erreur lors de la mise à jour du statut (non bloquant): ${dbError.message}`);
          // Ne pas bloquer si l'utilisateur n'existe pas encore dans notre table
        }
      } catch (error: any) {
        if (error instanceof ApiError) {
          throw error;
        }
        logger.error('Erreur lors de la vérification via access_token:', {
          message: error?.message,
          stack: error?.stack,
          error: error,
        });
        throw ApiError.badRequest(`Erreur lors de la vérification: ${error?.message || 'Erreur inconnue'}`);
      }
    }
    // Cas 2: Vérification via token OTP (ancienne méthode)
    else if (data.token) {
      const result = await authService.verifyEmail(data.token, data.type);

      if (result.error) {
        throw ApiError.badRequest(result.error.message);
      }

      if (!result.user) {
        throw ApiError.badRequest('Token invalide ou expiré');
      }

      user = result.user;
      verified = true;

      // Mettre à jour le statut de vérification dans notre table
      await authService.updateUserVerificationStatus(user.id, true);
      logger.info(`Email vérifié via OTP pour l'utilisateur: ${user.id}`);
    } else {
      throw ApiError.badRequest('Token ou accessToken requis');
    }

    if (!user) {
      throw ApiError.badRequest('Impossible de vérifier l\'utilisateur');
    }

    return NextResponse.json(
      ApiResponse.success(
        {
          userId: user.id,
          email: user.email,
          verified: verified,
        },
        'Email vérifié avec succès'
      ),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
