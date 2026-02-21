import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IStorageService } from '@/core/domain/services/IStorageService';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export interface UploadPhotoProfilInput {
  userId: string;
  photo: File;
}

export class UploadPhotoProfilProprietaireUseCase {
  constructor(
    private userRepository: IUserRepository,
    private storageService: IStorageService
  ) {}

  async execute(input: UploadPhotoProfilInput): Promise<string> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }
    if (user.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(input.photo.type)) {
      throw ApiError.badRequest('Type de fichier non autorisé. Formats acceptés: JPEG, PNG, WebP');
    }

    // Vérifier la taille (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (input.photo.size > maxSize) {
      throw ApiError.badRequest('La photo ne doit pas dépasser 5MB');
    }

    // Supprimer l'ancienne photo si elle existe
    if (user.photoProfil) {
      try {
        await this.storageService.deleteFile(user.photoProfil);
      } catch (error) {
        // Ignorer l'erreur si le fichier n'existe plus
      }
    }

    // Uploader la nouvelle photo
    const photoBuffer = Buffer.from(await input.photo.arrayBuffer());
    const photoUrl = await this.storageService.uploadAvatar(
      photoBuffer,
      input.photo.name,
      input.userId
    );

    // Mettre à jour le profil
    user.updateProfile({ photoProfil: photoUrl });
    await this.userRepository.update(user);

    return photoUrl;
  }
}
