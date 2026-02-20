import { IFavoriRepository } from '@/core/domain/repositories/IFavoriRepository';
import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { Favori } from '@/core/domain/entities/Favori.entity';
import { ApiError } from '@/shared/utils/ApiError';
import { randomUUID } from 'crypto';

export class AddFavoriUseCase {
  constructor(
    private favoriRepository: IFavoriRepository,
    private annonceRepository: IAnnonceRepository
  ) {}

  async execute(userId: string, annonceId: string) {
    // Vérifier que l'annonce existe
    const annonce = await this.annonceRepository.findById(annonceId);
    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    // Vérifier si déjà en favoris
    const existing = await this.favoriRepository.findByUserAndAnnonce(userId, annonceId);
    if (existing) {
      throw ApiError.conflict('Cette annonce est déjà dans vos favoris');
    }

    // Créer le favori
    const favori = new Favori(randomUUID(), userId, annonceId, new Date());
    await this.favoriRepository.save(favori);

    return favori;
  }
}
