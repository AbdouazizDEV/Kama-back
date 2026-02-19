import { NextResponse } from 'next/server';
import { AuthenticatedRequest } from './auth.middleware';
import { UserRole, hasPermission } from '@/shared/constants/roles.constant';
import { ApiError } from '@/shared/utils/ApiError';
import { ApiResponse } from '@/shared/utils/ApiResponse';

export function withRole(
  requiredRole: UserRole,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (request: AuthenticatedRequest): Promise<NextResponse> => {
    if (!request.user) {
      return NextResponse.json(
        ApiResponse.error({
          code: 'UNAUTHORIZED',
          message: 'Non authentifié',
        }),
        { status: 401 }
      );
    }

    const userRole = request.user.typeUtilisateur as UserRole;

    if (!hasPermission(userRole, requiredRole)) {
      return NextResponse.json(
        ApiResponse.error({
          code: 'FORBIDDEN',
          message: 'Permissions insuffisantes',
        }),
        { status: 403 }
      );
    }

    return await handler(request);
  };
}
