import { IMutuelleRepository } from '@/core/domain/repositories/IMutuelleRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class ResilierMutuelleUseCase {
  constructor(
    private mutuelleRepository: IMutuelleRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.typeUtilisateur !== UserType.ETUDIANT) {
      throw ApiError.forbidden('Accès réservé aux étudiants');
    }

    const mutuelle = await this.mutuelleRepository.findByUserId(userId);
    if (!mutuelle) {
      throw ApiError.notFound('Vous n\'avez pas d\'adhésion à la mutuelle');
    }

    if (!mutuelle.isActive()) {
      throw ApiError.conflict('Votre adhésion est déjà résiliée');
    }

    mutuelle.resiliate();
    await this.mutuelleRepository.update(mutuelle);
  }
}
