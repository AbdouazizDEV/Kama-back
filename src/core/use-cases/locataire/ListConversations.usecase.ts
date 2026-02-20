import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';

export class ListConversationsUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(userId: string) {
    // Récupérer toutes les réservations du locataire
    const reservations = await this.reservationRepository.findByLocataire(userId);

    // Pour chaque réservation, récupérer les messages
    const conversations = await Promise.all(
      reservations.map(async (reservation) => {
        const messages = await this.messageRepository.findByReservation(reservation.id);
        const unreadCount = messages.filter(
          (m) => m.destinataireId === userId && !m.estLu
        ).length;

        return {
          reservationId: reservation.id,
          annonceId: reservation.annonceId,
          proprietaireId: reservation.proprietaireId,
          statut: reservation.statut,
          dernierMessage: messages.length > 0 ? messages[messages.length - 1] : null,
          nombreMessages: messages.length,
          nombreMessagesNonLus: unreadCount,
        };
      })
    );

    return conversations;
  }
}
