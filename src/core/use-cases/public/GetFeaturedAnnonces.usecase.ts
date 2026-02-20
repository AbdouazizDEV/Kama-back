import { IAnnonceRepository } from '../../domain/repositories/IAnnonceRepository';
import { Annonce } from '../../domain/entities/Annonce.entity';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export interface GetFeaturedAnnoncesInput {
  limit?: number;
}

export class GetFeaturedAnnoncesUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: GetFeaturedAnnoncesInput): Promise<Annonce[]> {
    const limit = input.limit && input.limit > 0 && input.limit <= 20 ? input.limit : 10;

    // Récupérer les annonces les plus vues
    const { data } = await this.annonceRepository.search({
      page: 1,
      limit: limit * 2, // Récupérer plus pour filtrer
      sortBy: 'nombreVues',
      sortOrder: 'desc',
    });

    // Filtrer uniquement les annonces approuvées et disponibles
    const featuredAnnonces = data
      .filter(
        (annonce) =>
          annonce.statutModeration === StatutModeration.APPROUVE && annonce.estDisponible
      )
      .slice(0, limit);

    return featuredAnnonces;
  }
}
