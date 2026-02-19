import { NextRequest, NextResponse } from 'next/server';
import { RegisterUserUseCase } from '@/core/use-cases/auth/RegisterUser.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SendGridEmailService } from '@/infrastructure/email/SendGridEmailService';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { registerUserSchema } from '@/presentation/validators/auth.validator';
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
    const data = await validateRequest(request, registerUserSchema);

    // Injection de dépendances
    const userRepository = new SupabaseUserRepository();
    const emailService = new SendGridEmailService();
    const useCase = new RegisterUserUseCase(userRepository, emailService);

    // Exécution
    const user = await useCase.execute(data);

    logger.info(`Nouvel utilisateur créé: ${user.id}`);

    return NextResponse.json(
      ApiResponse.success(
        {
          id: user.id,
          email: user.email.getValue(),
          nom: user.nom,
          prenom: user.prenom,
          typeUtilisateur: user.typeUtilisateur,
        },
        'Inscription réussie. Veuillez vérifier votre email.'
      ),
      { status: 201 }
    );
  } catch (error) {
    return handleError(error);
  }
}
