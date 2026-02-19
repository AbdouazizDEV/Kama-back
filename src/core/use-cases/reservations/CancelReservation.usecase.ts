import { IReservationRepository } from '../../domain/repositories/IReservationRepository';
import { Reservation } from '../../domain/entities/Reservation.entity';
import { ApiError } from '@/shared/utils/ApiError';

export interface CancelReservationInput {
  reservationId: string;
  userId: string;
}

export class CancelReservationUseCase {
  constructor(private reservationRepository: IReservationRepository) {}

  async execute(input: CancelReservationInput): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(input.reservationId);
    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    // Vérifier que c'est le locataire ou le propriétaire
    if (
      reservation.locataireId !== input.userId &&
      reservation.proprietaireId !== input.userId
    ) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à annuler cette réservation');
    }

    reservation.cancel();
    await this.reservationRepository.update(reservation);

    return reservation;
  }
}
