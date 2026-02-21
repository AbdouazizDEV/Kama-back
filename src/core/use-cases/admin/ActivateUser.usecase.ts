import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class ActivateUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.estActif) {
      throw ApiError.conflict('Le compte utilisateur est déjà actif');
    }

    user.activate();
    await this.userRepository.update(user);
  }
}
