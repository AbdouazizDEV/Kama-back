import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class GetReservationDetailAdminUseCase {
  constructor(private reservationRepository: IReservationRepository) {}

  async execute(reservationId: string) {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    return reservation;
  }
}
