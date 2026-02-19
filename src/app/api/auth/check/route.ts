import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

async function handler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    if (!request.user) {
      return NextResponse.json(
        ApiResponse.error({
          code: 'UNAUTHORIZED',
          message: 'Token invalide',
        }),
        { status: 401 }
      );
    }

    return NextResponse.json(
      ApiResponse.success(
        {
          valid: true,
          user: {
            id: request.user.id,
            email: request.user.email,
            typeUtilisateur: request.user.typeUtilisateur,
          },
        },
        'Token valide'
      ),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}

export const GET = withAuth(handler);
