import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class GetConversationUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(conversationId: string, userId: string) {
    // conversationId est en fait le reservationId
    const reservation = await this.reservationRepository.findById(conversationId);

    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    // Vérifier que l'utilisateur fait partie de cette conversation
    if (reservation.locataireId !== userId && reservation.proprietaireId !== userId) {
      throw ApiError.forbidden('Vous n\'avez pas accès à cette conversation');
    }

    const messages = await this.messageRepository.findByReservation(conversationId);

    return {
      reservationId: reservation.id,
      annonceId: reservation.annonceId,
      messages: messages.map((m) => ({
        id: m.id,
        expediteurId: m.expediteurId,
        destinataireId: m.destinataireId,
        contenu: m.contenu,
        dateEnvoi: m.dateEnvoi,
        estLu: m.estLu,
        dateLecture: m.dateLecture,
      })),
    };
  }
}
