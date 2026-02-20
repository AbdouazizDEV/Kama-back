import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IStorageService } from '@/core/domain/services/IStorageService';
import { ApiError } from '@/shared/utils/ApiError';

export class UploadPhotoProfilUseCase {
  constructor(
    private userRepository: IUserRepository,
    private storageService: IStorageService
  ) {}

  async execute(userId: string, file: Buffer, fileName: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    // Supprimer l'ancienne photo si elle existe
    if (user.photoProfil) {
      try {
        await this.storageService.deleteFile(user.photoProfil);
      } catch (error) {
        // Ignorer l'erreur si le fichier n'existe pas
      }
    }

    // Uploader la nouvelle photo
    const photoUrl = await this.storageService.uploadAvatar(file, fileName, userId);

    // Mettre à jour le profil
    user.updateProfile({ photoProfil: photoUrl });
    await this.userRepository.update(user);

    return photoUrl;
  }
}
