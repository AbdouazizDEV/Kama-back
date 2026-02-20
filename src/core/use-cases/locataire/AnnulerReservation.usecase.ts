import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutReservation } from '@/shared/constants/statuses.constant';

export class AnnulerReservationUseCase {
  constructor(private reservationRepository: IReservationRepository) {}

  async execute(reservationId: string, locataireId: string, motif?: string) {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    // Vérifier que la réservation appartient au locataire
    if (reservation.locataireId !== locataireId) {
      throw ApiError.forbidden('Vous n\'avez pas accès à cette réservation');
    }

    // Vérifier que la réservation peut être annulée
    if (reservation.statut === StatutReservation.TERMINEE) {
      throw ApiError.conflict('Une réservation terminée ne peut pas être annulée');
    }

    if (reservation.statut === StatutReservation.ANNULEE) {
      throw ApiError.conflict('Cette réservation est déjà annulée');
    }

    // Annuler la réservation
    reservation.cancel();
    await this.reservationRepository.update(reservation);

    return reservation;
  }
}
