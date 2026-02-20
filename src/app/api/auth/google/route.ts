import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { rateLimitMiddleware } from '@/presentation/middlewares/ratelimit.middleware';

/**
 * GET /api/auth/google
 * Obtenir l'URL de redirection pour l'authentification Google
 * 
 * Query params:
 * - redirectTo (optionnel): URL de redirection après authentification
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) return rateLimitResponse;

    const searchParams = request.nextUrl.searchParams;
    const redirectTo = searchParams.get('redirectTo') || undefined;

    const authService = new SupabaseAuthService();
    const { url, error } = await authService.getGoogleAuthUrl(redirectTo);

    if (error || !url) {
      throw ApiError.internal(error?.message || 'Erreur lors de la génération de l\'URL Google');
    }

    return NextResponse.json(
      ApiResponse.success(
        {
          authUrl: url,
        },
        'URL d\'authentification Google générée'
      ),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
