import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { z } from 'zod';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';
import { supabase, supabaseAdmin } from '@/config/supabase.config';

const passwordField = z
  .string()
  .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
  .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
  .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
  .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre');

const resetPasswordSchema = z
  .object({
    /** Ancien flux : hash OTP (verifyOtp) */
    token: z.string().min(1).optional(),
    /** Flux lien e-mail Supabase : JWT dans le fragment (#access_token=…) */
    accessToken: z.string().min(1).optional(),
    newPassword: passwordField,
  })
  .superRefine((val, ctx) => {
    const hasOtp = Boolean(val.token);
    const hasJwt = Boolean(val.accessToken);
    if (hasOtp === hasJwt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Fournir exactement un des deux : token (OTP) ou accessToken (session recovery depuis le lien e-mail)',
      });
    }
  });

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const data = await validateRequest(request, resetPasswordSchema);
    const authService = new SupabaseAuthService();

    let userId: string;

    if (data.accessToken) {
      const { data: userData, error: getUserError } =
        await supabaseAdmin.auth.getUser(data.accessToken);

      if (getUserError || !userData.user) {
        throw ApiError.badRequest('Token invalide ou expiré');
      }

      const { error: adminError } = await supabaseAdmin.auth.admin.updateUserById(
        userData.user.id,
        { password: data.newPassword }
      );

      if (adminError) {
        throw ApiError.badRequest(adminError.message);
      }

      userId = userData.user.id;
    } else {
      const token = data.token;
      if (!token) {
        throw ApiError.badRequest('Token requis');
      }

      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery',
      });

      if (verifyError || !verifyData.user) {
        throw ApiError.badRequest('Token invalide ou expiré');
      }

      const { error } = await authService.updatePassword(data.newPassword);

      if (error) {
        throw ApiError.badRequest(error.message);
      }

      userId = verifyData.user.id;
    }

    logger.info(`Mot de passe réinitialisé pour l'utilisateur: ${userId}`);

    return NextResponse.json(
      ApiResponse.success(null, 'Mot de passe réinitialisé avec succès'),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
