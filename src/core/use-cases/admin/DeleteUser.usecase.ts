import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class DeleteUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, adminId: string): Promise<void> {
    // Empêcher un admin de se supprimer lui-même
    if (userId === adminId) {
      throw ApiError.forbidden('Vous ne pouvez pas supprimer votre propre compte');
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    // Empêcher la suppression d'autres admins (sécurité)
    if (user.typeUtilisateur === UserType.ADMIN) {
      throw ApiError.forbidden('Impossible de supprimer un compte administrateur');
    }

    await this.userRepository.delete(userId);
  }
}
