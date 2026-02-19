import { IReservationRepository } from '../../domain/repositories/IReservationRepository';
import { Reservation } from '../../domain/entities/Reservation.entity';
import { ApiError } from '@/shared/utils/ApiError';

export interface AcceptReservationInput {
  reservationId: string;
  proprietaireId: string;
}

export class AcceptReservationUseCase {
  constructor(private reservationRepository: IReservationRepository) {}

  async execute(input: AcceptReservationInput): Promise<Reservation> {
    const reservation = await this.reservationRepository.findById(input.reservationId);
    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    // Vérifier que c'est le propriétaire
    if (reservation.proprietaireId !== input.proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à accepter cette réservation');
    }

    reservation.accept();
    await this.reservationRepository.update(reservation);

    return reservation;
  }
}
