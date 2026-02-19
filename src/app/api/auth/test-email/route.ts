import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/config/supabase.config';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { z } from 'zod';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';

const testEmailSchema = z.object({
  email: z.string().email('Email invalide'),
});

/**
 * Endpoint de test pour vérifier l'envoi d'email
 * POST /api/auth/test-email
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await validateRequest(request, testEmailSchema);

    // Tester l'envoi d'un email de vérification
    const { data: resendData, error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: data.email,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/verify-email`,
      },
    });

    if (resendError) {
      logger.error('Erreur lors de l\'envoi de l\'email:', resendError);
      throw ApiError.badRequest(`Erreur lors de l'envoi: ${resendError.message}`);
    }

    logger.info(`Email de test envoyé à: ${data.email}`);

    return NextResponse.json(
      ApiResponse.success(
        {
          email: data.email,
          sent: true,
        },
        'Email de vérification envoyé avec succès'
      ),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
