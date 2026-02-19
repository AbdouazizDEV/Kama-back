import { NextRequest, NextResponse } from 'next/server';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { ApiError } from '@/shared/utils/ApiError';
import { ApiResponse } from '@/shared/utils/ApiResponse';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    typeUtilisateur: string;
  };
}

export async function authMiddleware(
  request: NextRequest
): Promise<AuthenticatedRequest> {
  const authHeader = request.headers.get('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw ApiError.unauthorized('Token manquant');
  }

  const token = authHeader.substring(7);

  try {
    const authService = new SupabaseAuthService();
    const decoded = await authService.verifyToken(token);

    (request as AuthenticatedRequest).user = {
      id: decoded.userId,
      email: decoded.email,
      typeUtilisateur: decoded.typeUtilisateur,
    };

    return request as AuthenticatedRequest;
  } catch (error) {
    throw ApiError.unauthorized('Token invalide ou expiré');
  }
}

export function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      const authenticatedRequest = await authMiddleware(request);
      return await handler(authenticatedRequest);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json(
          ApiResponse.error({
            code: error.code,
            message: error.message,
            details: error.details,
          }),
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        ApiResponse.error({
          code: 'INTERNAL_ERROR',
          message: 'Erreur serveur',
        }),
        { status: 500 }
      );
    }
  };
}
