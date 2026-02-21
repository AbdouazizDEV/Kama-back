import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { StatutReservation } from '@/shared/constants/statuses.constant';

export interface RefuserReservationInput {
  reservationId: string;
  proprietaireId: string;
  motif?: string;
}

export class RefuserReservationProprietaireUseCase {
  constructor(
    private reservationRepository: IReservationRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: RefuserReservationInput): Promise<void> {
    const proprietaire = await this.userRepository.findById(input.proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const reservation = await this.reservationRepository.findById(input.reservationId);
    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    if (reservation.proprietaireId !== input.proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à modifier cette réservation');
    }

    if (reservation.statut !== StatutReservation.EN_ATTENTE) {
      throw ApiError.conflict('Seules les réservations en attente peuvent être refusées');
    }

    reservation.reject();
    await this.reservationRepository.update(reservation);
  }
}
