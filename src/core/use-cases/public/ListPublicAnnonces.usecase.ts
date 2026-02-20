import { IAnnonceRepository } from '../../domain/repositories/IAnnonceRepository';
import { Annonce } from '../../domain/entities/Annonce.entity';
import { StatutModeration } from '@/shared/constants/statuses.constant';
import { validatePaginationParams } from '@/shared/utils/pagination';

export interface ListPublicAnnoncesInput {
  page?: number;
  limit?: number;
  sortBy?: 'dateCreation' | 'prix' | 'nombreVues';
  sortOrder?: 'asc' | 'desc';
}

export interface ListPublicAnnoncesOutput {
  data: Annonce[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ListPublicAnnoncesUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: ListPublicAnnoncesInput): Promise<ListPublicAnnoncesOutput> {
    const { page, limit } = validatePaginationParams(input.page, input.limit);

    const { data, total } = await this.annonceRepository.search({
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

    const totalPages = Math.ceil(total / limit);

    return {
      data: publicAnnonces,
      total: publicAnnonces.length,
      page,
      limit,
      totalPages,
    };
  }
}
