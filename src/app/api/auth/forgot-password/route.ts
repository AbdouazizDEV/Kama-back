import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { z } from 'zod';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { rateLimitMiddleware } from '@/presentation/middlewares/ratelimit.middleware';
import { logger } from '@/shared/utils/logger';

const forgotPasswordSchema = z.object({
  email: z.string().email('Email invalide'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) return rateLimitResponse;

    const data = await validateRequest(request, forgotPasswordSchema);
    const authService = new SupabaseAuthService();

    const { error } = await authService.resetPasswordForEmail(data.email);

    if (error) {
      logger.warn(`Erreur lors de l'envoi de l'email de réinitialisation: ${error.message}`);
    }

    // Toujours retourner un succès pour ne pas révéler si l'email existe
    return NextResponse.json(
      ApiResponse.success(
        null,
        'Si cet email existe, un lien de réinitialisation a été envoyé.'
      ),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
