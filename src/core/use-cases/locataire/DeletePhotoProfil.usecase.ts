import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IStorageService } from '@/core/domain/services/IStorageService';
import { ApiError } from '@/shared/utils/ApiError';

export class DeletePhotoProfilUseCase {
  constructor(
    private userRepository: IUserRepository,
    private storageService: IStorageService
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (!user.photoProfil) {
      throw ApiError.notFound('Photo de profil');
    }

    // Supprimer le fichier
    try {
      await this.storageService.deleteFile(user.photoProfil);
    } catch (error) {
      // Ignorer l'erreur si le fichier n'existe pas
    }

    // Mettre à jour le profil
    user.updateProfile({ photoProfil: null });
    await this.userRepository.update(user);
  }
}
