import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class MarkMessageAsReadUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(messageId: string, userId: string) {
    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      throw ApiError.notFound('Message');
    }

    // Vérifier que l'utilisateur est le destinataire
    if (message.destinataireId !== userId) {
      throw ApiError.forbidden('Vous n\'êtes pas le destinataire de ce message');
    }

    // Marquer comme lu
    await this.messageRepository.markAsRead(messageId, userId);
  }
}
