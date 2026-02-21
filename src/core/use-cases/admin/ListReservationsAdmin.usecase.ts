import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { Reservation } from '@/core/domain/entities/Reservation.entity';
import { validatePaginationParams, calculatePagination } from '@/shared/utils/pagination';
import { StatutReservation } from '@/shared/constants/statuses.constant';

export interface ListReservationsAdminInput {
  page?: number;
  limit?: number;
  statut?: 'EN_ATTENTE' | 'ACCEPTEE' | 'REJETEE' | 'ANNULEE' | 'TERMINEE';
  locataireId?: string;
  proprietaireId?: string;
  dateDebut?: string;
  dateFin?: string;
}

export interface ListReservationsAdminOutput {
  data: Reservation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListReservationsAdminUseCase {
  constructor(private reservationRepository: IReservationRepository) {}

  async execute(input: ListReservationsAdminInput): Promise<ListReservationsAdminOutput> {
    const { page, limit } = validatePaginationParams(input.page, input.limit);

    // Récupérer toutes les réservations
    const allReservations = await this.reservationRepository.findAll();

    // Appliquer les filtres
    let filtered = allReservations;

    if (input.statut) {
      filtered = filtered.filter((r) => r.statut === input.statut);
    }
    if (input.locataireId) {
      filtered = filtered.filter((r) => r.locataireId === input.locataireId);
    }
    if (input.proprietaireId) {
      filtered = filtered.filter((r) => r.proprietaireId === input.proprietaireId);
    }
    if (input.dateDebut) {
      const dateDebut = new Date(input.dateDebut);
      filtered = filtered.filter((r) => r.dateDebut >= dateDebut);
    }
    if (input.dateFin) {
      const dateFin = new Date(input.dateFin);
      filtered = filtered.filter((r) => r.dateFin <= dateFin);
    }

    // Trier par date de création (plus récentes en premier)
    filtered.sort((a, b) => b.dateCreation.getTime() - a.dateCreation.getTime());

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
