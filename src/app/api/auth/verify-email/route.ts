import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { z } from 'zod';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';
import { supabase } from '@/config/supabase.config';

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
        // Créer un client Supabase avec le token pour vérifier
        const { createClient } = await import('@supabase/supabase-js');
        const { env } = await import('@/config/env.config');
        
        const tempClient = createClient(env.supabase.url, env.supabase.anonKey, {
          global: {
            headers: {
              Authorization: `Bearer ${data.accessToken}`,
            },
          },
        });

        const { data: userData, error: tokenError } = await tempClient.auth.getUser();

        if (tokenError) {
          logger.error('Erreur lors de la vérification du token:', tokenError);
          throw ApiError.badRequest(`Token d'accès invalide ou expiré: ${tokenError.message}`);
        }

        if (!userData.user) {
          throw ApiError.badRequest('Token d\'accès invalide ou expiré');
        }

        user = userData.user;

        // Vérifier si l'email est déjà vérifié
        if (user.email_confirmed_at) {
          verified = true;
          // Mettre à jour le statut dans notre table
          try {
            await authService.updateUserVerificationStatus(user.id, true);
            logger.info(`Email déjà vérifié pour l'utilisateur: ${user.id}`);
          } catch (dbError: any) {
            logger.warn(`Erreur lors de la mise à jour du statut (non bloquant): ${dbError.message}`);
            // Ne pas bloquer si l'utilisateur n'existe pas encore dans notre table
          }
        } else {
          throw ApiError.badRequest('L\'email n\'a pas encore été vérifié');
        }
      } catch (error: any) {
        if (error instanceof ApiError) {
          throw error;
        }
        logger.error('Erreur lors de la vérification via access_token:', error);
        throw ApiError.badRequest(`Erreur lors de la vérification: ${error.message || 'Erreur inconnue'}`);
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
