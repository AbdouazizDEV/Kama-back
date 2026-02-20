import { IAnnonceRepository } from '../../domain/repositories/IAnnonceRepository';
import { Annonce } from '../../domain/entities/Annonce.entity';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export interface GetRecentAnnoncesInput {
  limit?: number;
}

export class GetRecentAnnoncesUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: GetRecentAnnoncesInput): Promise<Annonce[]> {
    const limit = input.limit && input.limit > 0 && input.limit <= 20 ? input.limit : 10;

    // Récupérer les annonces les plus récentes
    const { data } = await this.annonceRepository.search({
      page: 1,
      limit: limit * 2, // Récupérer plus pour filtrer
      sortBy: 'dateCreation',
      sortOrder: 'desc',
    });

    // Filtrer uniquement les annonces approuvées et disponibles
    const recentAnnonces = data
      .filter(
        (annonce) =>
          annonce.statutModeration === StatutModeration.APPROUVE && annonce.estDisponible
      )
      .slice(0, limit);

    return recentAnnonces;
  }
}
