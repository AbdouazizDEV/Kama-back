import { IAnnonceRepository, SearchCriteria } from '@/core/domain/repositories/IAnnonceRepository';
import { Annonce } from '@/core/domain/entities/Annonce.entity';
import { validatePaginationParams, calculatePagination } from '@/shared/utils/pagination';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export interface ListAnnoncesAdminInput {
  page?: number;
  limit?: number;
  statutModeration?: 'EN_ATTENTE' | 'APPROUVE' | 'REJETE';
  proprietaireId?: string;
  ville?: string;
  typeBien?: 'APPARTEMENT' | 'MAISON' | 'TERRAIN' | 'VEHICULE';
}

export interface ListAnnoncesAdminOutput {
  data: Annonce[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListAnnoncesAdminUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: ListAnnoncesAdminInput): Promise<ListAnnoncesAdminOutput> {
    const { page, limit } = validatePaginationParams(input.page, input.limit);

    const criteria: SearchCriteria = {
      page,
      limit,
      ville: input.ville,
      typeBien: input.typeBien,
      sortBy: 'dateCreation',
      sortOrder: 'desc',
    };

    const { data, total } = await this.annonceRepository.search(criteria);

    // Filtrer par statut de modération si spécifié
    let filteredData = data;
    if (input.statutModeration) {
      filteredData = data.filter((a) => a.statutModeration === input.statutModeration);
    }

    // Filtrer par propriétaire si spécifié
    if (input.proprietaireId) {
      filteredData = filteredData.filter((a) => a.proprietaireId === input.proprietaireId);
    }

    const { totalPages } = calculatePagination(page, limit, filteredData.length);

    return {
      data: filteredData,
      pagination: {
        page,
        limit,
        total: filteredData.length,
        totalPages,
      },
    };
  }
}
