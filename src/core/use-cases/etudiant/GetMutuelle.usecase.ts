import { IMutuelleRepository } from '@/core/domain/repositories/IMutuelleRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class GetMutuelleUseCase {
  constructor(
    private mutuelleRepository: IMutuelleRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.typeUtilisateur !== UserType.ETUDIANT) {
      throw ApiError.forbidden('Accès réservé aux étudiants');
    }

    const mutuelle = await this.mutuelleRepository.findByUserId(userId);
    if (!mutuelle) {
      return {
        hasMutuelle: false,
        mutuelle: null,
      };
    }

    return {
      hasMutuelle: true,
      mutuelle: {
        id: mutuelle.id,
        numeroAdhesion: mutuelle.numeroAdhesion,
        dateAdhesion: mutuelle.dateAdhesion,
        dateResiliation: mutuelle.dateResiliation,
        estActive: mutuelle.isActive(),
      },
    };
  }
}
