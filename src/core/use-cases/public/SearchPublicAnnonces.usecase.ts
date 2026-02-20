import { IAnnonceRepository, SearchCriteria } from '../../domain/repositories/IAnnonceRepository';
import { Annonce } from '../../domain/entities/Annonce.entity';
import { StatutModeration } from '@/shared/constants/statuses.constant';
import { validatePaginationParams } from '@/shared/utils/pagination';

export interface SearchPublicAnnoncesInput extends Omit<SearchCriteria, 'page' | 'limit'> {
  page?: number;
  limit?: number;
}

export interface SearchPublicAnnoncesOutput {
  data: Annonce[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SearchPublicAnnoncesUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: SearchPublicAnnoncesInput): Promise<SearchPublicAnnoncesOutput> {
    const { page, limit } = validatePaginationParams(input.page, input.limit);

    const { data, total } = await this.annonceRepository.search({
      ...input,
      page,
      limit,
      sortBy: input.sortBy || 'dateCreation',
      sortOrder: input.sortOrder || 'desc',
    });

    // Filtrer uniquement les annonces approuvées et disponibles
    const publicAnnonces = data.filter(
      (annonce) =>
        annonce.statutModeration === StatutModeration.APPROUVE && annonce.estDisponible
    );

    const totalPages = Math.ceil(publicAnnonces.length / limit);

    return {
      data: publicAnnonces,
      total: publicAnnonces.length,
      page,
      limit,
      totalPages,
    };
  }
}
