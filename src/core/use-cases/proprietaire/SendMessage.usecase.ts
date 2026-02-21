import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { Message } from '@/core/domain/entities/Message.entity';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { randomUUID } from 'crypto';

export interface SendMessageProprietaireInput {
  reservationId: string;
  proprietaireId: string;
  destinataireId: string;
  contenu: string;
}

export class SendMessageProprietaireUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private userRepository: IUserRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(input: SendMessageProprietaireInput): Promise<Message> {
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
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à envoyer un message pour cette réservation');
    }

    if (reservation.locataireId !== input.destinataireId) {
      throw ApiError.forbidden('Le destinataire doit être le locataire de cette réservation');
    }

    const message = new Message(
      randomUUID(),
      input.reservationId,
      input.proprietaireId,
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
