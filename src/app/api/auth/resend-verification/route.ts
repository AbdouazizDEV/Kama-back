import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { z } from 'zod';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';

const resendVerificationSchema = z.object({
  email: z.string().email('Email invalide'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await validateRequest(request, resendVerificationSchema);
    const authService = new SupabaseAuthService();

    const { error } = await authService.resendVerificationEmail(data.email);

    if (error) {
      // Ne pas révéler si l'email existe ou non (sécurité)
      logger.warn(`Erreur lors de l'envoi de l'email de vérification: ${error.message}`);
    }

    // Toujours retourner un succès pour ne pas révéler si l'email existe
    return NextResponse.json(
      ApiResponse.success(
        null,
        'Si cet email existe et n\'est pas encore vérifié, un email de vérification a été envoyé.'
      ),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
