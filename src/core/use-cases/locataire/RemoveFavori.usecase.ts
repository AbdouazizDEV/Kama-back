import { IFavoriRepository } from '@/core/domain/repositories/IFavoriRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class RemoveFavoriUseCase {
  constructor(private favoriRepository: IFavoriRepository) {}

  async execute(userId: string, annonceId: string) {
    // Vérifier que le favori existe
    const favori = await this.favoriRepository.findByUserAndAnnonce(userId, annonceId);
    if (!favori) {
      throw ApiError.notFound('Favori');
    }

    // Supprimer le favori
    await this.favoriRepository.deleteByUserAndAnnonce(userId, annonceId);
  }
}
