import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IStorageService } from '@/core/domain/services/IStorageService';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export interface UploadPhotosAnnonceInput {
  annonceId: string;
  proprietaireId: string;
  photos: File[];
}

export class UploadPhotosAnnonceProprietaireUseCase {
  constructor(
    private annonceRepository: IAnnonceRepository,
    private userRepository: IUserRepository,
    private storageService: IStorageService
  ) {}

  async execute(input: UploadPhotosAnnonceInput): Promise<string[]> {
    const proprietaire = await this.userRepository.findById(input.proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const annonce = await this.annonceRepository.findById(input.annonceId);
    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    if (annonce.proprietaireId !== input.proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à modifier cette annonce');
    }

    // Vérifier le nombre de photos (max 10)
    const maxPhotos = 10;
    const totalPhotos = annonce.photos.length + input.photos.length;
    if (totalPhotos > maxPhotos) {
      throw ApiError.badRequest(`Maximum ${maxPhotos} photos autorisées`);
    }

    // Vérifier les types et tailles
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    const photoUrls: string[] = [];

    for (const photo of input.photos) {
      if (!allowedTypes.includes(photo.type)) {
        throw ApiError.badRequest(`Type de fichier non autorisé: ${photo.name}`);
      }
      if (photo.size > maxSize) {
        throw ApiError.badRequest(`La photo ${photo.name} dépasse 5MB`);
      }

      const photoBuffer = Buffer.from(await photo.arrayBuffer());
      const photoUrl = await this.storageService.uploadAnnonceImage(
        photoBuffer,
        photo.name,
        input.annonceId
      );
      photoUrls.push(photoUrl);
    }

    // Ajouter les nouvelles photos à l'annonce
    annonce.photos = [...annonce.photos, ...photoUrls];
    await this.annonceRepository.update(annonce);

    return photoUrls;
  }
}
