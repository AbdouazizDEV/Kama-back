import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { StatutReservation } from '@/shared/constants/statuses.constant';

export class SignerContratProprietaireUseCase {
  constructor(
    private reservationRepository: IReservationRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(reservationId: string, proprietaireId: string): Promise<void> {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    if (reservation.proprietaireId !== proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à signer ce contrat');
    }

    if (reservation.statut !== StatutReservation.ACCEPTEE) {
      throw ApiError.conflict('Seules les réservations acceptées peuvent être signées');
    }

    // TODO: Implémenter la signature électronique
    // Pour l'instant, on marque juste que le contrat est signé
    // Il faudrait créer une table Contrat avec signature électronique
  }
}
