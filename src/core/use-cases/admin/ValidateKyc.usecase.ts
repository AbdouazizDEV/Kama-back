import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class ValidateKycUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.estVerifie) {
      throw ApiError.conflict('La vérification KYC est déjà validée pour cet utilisateur');
    }

    user.verify();
    await this.userRepository.update(user);
  }
}
