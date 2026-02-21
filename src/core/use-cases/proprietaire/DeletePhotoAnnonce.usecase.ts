import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IStorageService } from '@/core/domain/services/IStorageService';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class DeletePhotoAnnonceProprietaireUseCase {
  constructor(
    private annonceRepository: IAnnonceRepository,
    private userRepository: IUserRepository,
    private storageService: IStorageService
  ) {}

  async execute(annonceId: string, photoUrl: string, proprietaireId: string): Promise<void> {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const annonce = await this.annonceRepository.findById(annonceId);
    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    if (annonce.proprietaireId !== proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à modifier cette annonce');
    }

    if (!annonce.photos.includes(photoUrl)) {
      throw ApiError.notFound('Photo');
    }

    // Vérifier qu'il reste au moins une photo
    if (annonce.photos.length <= 1) {
      throw ApiError.conflict('Une annonce doit avoir au moins une photo');
    }

    // Supprimer le fichier du storage
    try {
      await this.storageService.deleteFile(photoUrl);
    } catch (error) {
      // Continuer même si la suppression du fichier échoue
    }

    // Retirer la photo de la liste
    annonce.photos = annonce.photos.filter((url) => url !== photoUrl);
    await this.annonceRepository.update(annonce);
  }
}
