import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { z } from 'zod';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Le token est requis'),
  type: z.enum(['email', 'signup', 'recovery']).optional().default('signup'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await validateRequest(request, verifyEmailSchema);
    const authService = new SupabaseAuthService();

    const { user, session, error } = await authService.verifyEmail(data.token, data.type);

    if (error) {
      throw ApiError.badRequest(error.message);
    }

    if (!user) {
      throw ApiError.badRequest('Token invalide ou expiré');
    }

    // Mettre à jour le statut de vérification dans notre table
    await authService.updateUserVerificationStatus(user.id, true);

    logger.info(`Email vérifié pour l'utilisateur: ${user.id}`);

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
