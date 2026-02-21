import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutReservation } from '@/shared/constants/statuses.constant';

export interface CancelReservationAdminInput {
  reservationId: string;
  motif: string;
}

export class CancelReservationAdminUseCase {
  constructor(private reservationRepository: IReservationRepository) {}

  async execute(input: CancelReservationAdminInput): Promise<void> {
    const reservation = await this.reservationRepository.findById(input.reservationId);

    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    if (reservation.statut === StatutReservation.TERMINEE) {
      throw ApiError.conflict('Une réservation terminée ne peut pas être annulée');
    }

    if (reservation.statut === StatutReservation.ANNULEE) {
      throw ApiError.conflict('La réservation est déjà annulée');
    }

    reservation.cancel();
    await this.reservationRepository.update(reservation);

    // TODO: Stocker le motif d'annulation si nécessaire
  }
}
