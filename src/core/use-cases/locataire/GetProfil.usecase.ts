import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { User } from '@/core/domain/entities/User.entity';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class GetProfilUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }
    if (user.typeUtilisateur !== UserType.LOCATAIRE) {
      throw ApiError.forbidden('Accès refusé. Seuls les locataires peuvent consulter ce profil.');
    }
    return user;
  }
}
