import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class CountMessagesNonLusProprietaireUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private userRepository: IUserRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(proprietaireId: string): Promise<number> {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    // Récupérer toutes les réservations du propriétaire
    const reservations = await this.reservationRepository.findByProprietaire(proprietaireId);

    // Compter les messages non lus pour chaque réservation
    let totalNonLus = 0;
    for (const reservation of reservations) {
      const messages = await this.messageRepository.findByReservation(reservation.id);
      const nonLus = messages.filter(
        (m) => !m.estLu && m.destinataireId === proprietaireId
      ).length;
      totalNonLus += nonLus;
    }

    return totalNonLus;
  }
}
