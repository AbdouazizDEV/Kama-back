import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { StatutReservation } from '@/shared/constants/statuses.constant';

export interface ReservationsStatistics {
  total: number;
  parStatut: {
    EN_ATTENTE: number;
    ACCEPTEE: number;
    REJETEE: number;
    ANNULEE: number;
    TERMINEE: number;
  };
  revenusTotal: number;
  revenusMoyen: number;
  dureeMoyenne: number; // en jours
  creesParMois: Array<{
    mois: string;
    count: number;
  }>;
}

export class GetReservationsStatisticsUseCase {
  constructor(private reservationRepository: IReservationRepository) {}

  async execute(): Promise<ReservationsStatistics> {
    const allReservations = await this.reservationRepository.findAll();

    const total = allReservations.length;
    const enAttente = allReservations.filter((r) => r.statut === StatutReservation.EN_ATTENTE).length;
    const acceptees = allReservations.filter((r) => r.statut === StatutReservation.ACCEPTEE).length;
    const rejetees = allReservations.filter((r) => r.statut === StatutReservation.REJETEE).length;
    const annulees = allReservations.filter((r) => r.statut === StatutReservation.ANNULEE).length;
    const terminees = allReservations.filter((r) => r.statut === StatutReservation.TERMINEE).length;

    const reservationsTerminees = allReservations.filter((r) => r.statut === StatutReservation.TERMINEE);
    const revenusTotal = reservationsTerminees.reduce((sum, r) => sum + r.prixTotal.getMontant(), 0);
    const revenusMoyen = reservationsTerminees.length > 0 ? revenusTotal / reservationsTerminees.length : 0;

    const durees = allReservations.map((r) => r.getDurationInDays());
    const dureeMoyenne = durees.length > 0 ? Math.round(durees.reduce((sum, d) => sum + d, 0) / durees.length) : 0;

    const creesParMois = this.groupByMonth(allReservations);

    return {
      total,
      parStatut: {
        EN_ATTENTE: enAttente,
        ACCEPTEE: acceptees,
        REJETEE: rejetees,
        ANNULEE: annulees,
        TERMINEE: terminees,
      },
      revenusTotal,
      revenusMoyen: Math.round(revenusMoyen),
      dureeMoyenne,
      creesParMois,
    };
  }

  private groupByMonth(reservations: any[]): Array<{ mois: string; count: number }> {
    const grouped = new Map<string, number>();

    reservations.forEach((reservation) => {
      const date = new Date(reservation.dateCreation);
      const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      grouped.set(mois, (grouped.get(mois) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([mois, count]) => ({ mois, count }))
      .sort((a, b) => a.mois.localeCompare(b.mois));
  }
}
