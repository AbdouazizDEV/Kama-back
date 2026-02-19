import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';

export interface VerifyEmailInput {
  userId: string;
  token: string;
}

export class VerifyEmailUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: VerifyEmailInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.estVerifie) {
      throw ApiError.conflict('Cet email est déjà vérifié');
    }

    // TODO: Vérifier le token de vérification
    // Pour l'instant, on vérifie directement
    user.verify();
    await this.userRepository.update(user);
  }
}
