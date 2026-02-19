import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { logger } from '@/shared/utils/logger';

async function handler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    const authService = new SupabaseAuthService();

    // Déconnexion via Supabase Auth
    const { error } = await authService.signOut();

    if (error) {
      logger.warn(`Erreur lors de la déconnexion: ${error.message}`);
    }

    logger.info(`Déconnexion réussie pour l'utilisateur: ${request.user?.id}`);

    return NextResponse.json(
      ApiResponse.success(null, 'Déconnexion réussie'),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

export const POST = withAuth(handler);
