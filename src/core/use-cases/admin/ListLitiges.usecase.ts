import { ILitigeRepository, LitigeFilters } from '@/core/domain/repositories/ILitigeRepository';
import { Litige } from '@/core/domain/entities/Litige.entity';
import { validatePaginationParams, calculatePagination } from '@/shared/utils/pagination';

export interface ListLitigesInput {
  page?: number;
  limit?: number;
  statut?: 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'FERME';
  type?: 'RESERVATION' | 'PAIEMENT' | 'ANNONCE' | 'AUTRE';
}

export interface ListLitigesOutput {
  data: Litige[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListLitigesUseCase {
  constructor(private litigeRepository: ILitigeRepository) {}

  async execute(input: ListLitigesInput): Promise<ListLitigesOutput> {
    const { page, limit } = validatePaginationParams(input.page, input.limit);

    const filters: LitigeFilters = {
      statut: input.statut,
      type: input.type,
    };

    const allLitiges = await this.litigeRepository.findAll(filters);

    // Filtrer par statut et type si spécifiés
    let filtered = allLitiges;
    if (input.statut) {
      filtered = filtered.filter((l) => l.statut === input.statut);
    }
    if (input.type) {
      filtered = filtered.filter((l) => l.type === input.type);
    }

    const total = filtered.length;
    const { skip, totalPages } = calculatePagination(page, limit, total);
    const paginated = filtered.slice(skip, skip + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
