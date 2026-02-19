import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { z } from 'zod';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';
import { supabase } from '@/config/supabase.config';

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Le token est requis'),
  newPassword: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await validateRequest(request, resetPasswordSchema);
    const authService = new SupabaseAuthService();

    // Vérifier le token de réinitialisation
    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: data.token,
      type: 'recovery',
    });

    if (verifyError || !verifyData.user) {
      throw ApiError.badRequest('Token invalide ou expiré');
    }

    // Mettre à jour le mot de passe
    const { error } = await authService.updatePassword(data.newPassword);

    if (error) {
      throw ApiError.badRequest(error.message);
    }

    logger.info(`Mot de passe réinitialisé pour l'utilisateur: ${verifyData.user.id}`);

    return NextResponse.json(
      ApiResponse.success(null, 'Mot de passe réinitialisé avec succès'),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
