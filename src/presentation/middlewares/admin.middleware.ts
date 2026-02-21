import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from './auth.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { UserType } from '@/core/domain/entities/User.entity';

/**
 * Middleware pour vérifier que l'utilisateur est un administrateur
 */
export function withAdmin(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    if (!req.user) {
      return NextResponse.json(
        ApiResponse.error({
          code: 'UNAUTHORIZED',
          message: 'Non authentifié',
        }),
        { status: 401 }
      );
    }

    if (req.user.typeUtilisateur !== UserType.ADMIN) {
      return NextResponse.json(
        ApiResponse.error({
          code: 'FORBIDDEN',
          message: 'Accès réservé aux administrateurs',
        }),
        { status: 403 }
      );
    }

    return await handler(req);
  });
}
