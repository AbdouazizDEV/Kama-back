import { NextRequest, NextResponse } from 'next/server';
import { LoginUserUseCase } from '@/core/use-cases/auth/LoginUser.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { loginUserSchema } from '@/presentation/validators/auth.validator';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { rateLimitMiddleware } from '@/presentation/middlewares/ratelimit.middleware';
import { logger } from '@/shared/utils/logger';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Rate limiting
    const rateLimitResponse = rateLimitMiddleware(request);
    if (rateLimitResponse) return rateLimitResponse;

    // Validation
    const data = await validateRequest(request, loginUserSchema);

    // Injection de dépendances
    const userRepository = new SupabaseUserRepository();
    const authService = new SupabaseAuthService();
    const useCase = new LoginUserUseCase(userRepository, authService);

    // Exécution
    const result = await useCase.execute(data);

    logger.info(`Connexion réussie: ${result.user.email}`);

    return NextResponse.json(ApiResponse.success(result, 'Connexion réussie'), {
      status: 200,
    });
  } catch (error) {
    return handleError(error);
  }
}
