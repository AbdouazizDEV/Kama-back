import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { Message } from '@/core/domain/entities/Message.entity';
import { ApiError } from '@/shared/utils/ApiError';
import { randomUUID } from 'crypto';

export interface SendMessageInput {
  reservationId: string;
  expediteurId: string;
  destinataireId: string;
  contenu: string;
}

export class SendMessageUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(input: SendMessageInput) {
    // Vérifier que la réservation existe
    const reservation = await this.reservationRepository.findById(input.reservationId);
    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    // Vérifier que l'expéditeur fait partie de la réservation
    if (
      reservation.locataireId !== input.expediteurId &&
      reservation.proprietaireId !== input.expediteurId
    ) {
      throw ApiError.forbidden('Vous n\'avez pas accès à cette réservation');
    }

    // Vérifier que le destinataire fait partie de la réservation
    if (
      reservation.locataireId !== input.destinataireId &&
      reservation.proprietaireId !== input.destinataireId
    ) {
      throw ApiError.forbidden('Le destinataire n\'a pas accès à cette réservation');
    }

    // Créer le message
    const message = new Message(
      randomUUID(),
      input.reservationId,
      input.expediteurId,
      input.destinataireId,
      input.contenu,
      new Date(),
      false,
      null
    );

    await this.messageRepository.save(message);

    return message;
  }
}
