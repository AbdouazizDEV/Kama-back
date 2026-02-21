import { IAnnonceRepository, SearchCriteria } from '@/core/domain/repositories/IAnnonceRepository';
import { Annonce } from '@/core/domain/entities/Annonce.entity';
import { validatePaginationParams, calculatePagination } from '@/shared/utils/pagination';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export interface GetPendingModerationAnnoncesInput {
  page?: number;
  limit?: number;
}

export interface GetPendingModerationAnnoncesOutput {
  data: Annonce[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class GetPendingModerationAnnoncesUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: GetPendingModerationAnnoncesInput): Promise<GetPendingModerationAnnoncesOutput> {
    const { page, limit } = validatePaginationParams(input.page, input.limit);

    const criteria: SearchCriteria = {
      page,
      limit,
      sortBy: 'dateCreation',
      sortOrder: 'desc',
    };

    const { data, total } = await this.annonceRepository.search(criteria);

    // Filtrer uniquement les annonces en attente
    const pendingAnnonces = data.filter((a) => a.statutModeration === StatutModeration.EN_ATTENTE);

    const { totalPages } = calculatePagination(page, limit, pendingAnnonces.length);

    return {
      data: pendingAnnonces,
      pagination: {
        page,
        limit,
        total: pendingAnnonces.length,
        totalPages,
      },
    };
  }
}
