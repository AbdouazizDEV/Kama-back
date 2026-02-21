import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { Paiement } from '@/core/domain/entities/Paiement.entity';
import { validatePaginationParams, calculatePagination } from '@/shared/utils/pagination';
import { StatutPaiement } from '@/shared/constants/statuses.constant';

export interface ListPaiementsAdminInput {
  page?: number;
  limit?: number;
  statut?: 'EN_ATTENTE' | 'VALIDE' | 'ECHOUE' | 'REMBOURSE';
  locataireId?: string;
  proprietaireId?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ListPaiementsAdminOutput {
  data: Paiement[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListPaiementsAdminUseCase {
  constructor(private paiementRepository: IPaiementRepository) {}

  async execute(input: ListPaiementsAdminInput): Promise<ListPaiementsAdminOutput> {
    const { page, limit } = validatePaginationParams(input.page, input.limit);

    const allPaiements = await this.paiementRepository.findAll();

    // Appliquer les filtres
    let filtered = allPaiements;

    if (input.statut) {
      filtered = filtered.filter((p) => p.statut === input.statut);
    }
    if (input.locataireId) {
      filtered = filtered.filter((p) => p.locataireId === input.locataireId);
    }
    if (input.proprietaireId) {
      filtered = filtered.filter((p) => p.proprietaireId === input.proprietaireId);
    }
    if (input.dateDebut) {
      const dateDebut = new Date(input.dateDebut);
      filtered = filtered.filter((p) => p.dateCreation >= dateDebut);
    }
    if (input.dateFin) {
      const dateFin = new Date(input.dateFin);
      filtered = filtered.filter((p) => p.dateCreation <= dateFin);
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
