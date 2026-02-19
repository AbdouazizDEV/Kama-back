import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { z } from 'zod';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Le refresh token est requis'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await validateRequest(request, refreshTokenSchema);
    const authService = new SupabaseAuthService();

    const { user, session, error } = await authService.refreshSession(data.refreshToken);

    if (error) {
      throw ApiError.unauthorized('Token de rafraîchissement invalide ou expiré');
    }

    if (!session) {
      throw ApiError.unauthorized('Impossible de rafraîchir la session');
    }

    logger.info(`Token rafraîchi pour l'utilisateur: ${user?.id}`);

    return NextResponse.json(
      ApiResponse.success(
        {
          accessToken: session.access_token,
          refreshToken: session.refresh_token,
          expiresAt: session.expires_at,
          expiresIn: session.expires_in,
        },
        'Token rafraîchi avec succès'
      ),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
