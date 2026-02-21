import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class MarkMessageAsReadProprietaireUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(messageId: string, proprietaireId: string): Promise<void> {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const message = await this.messageRepository.findById(messageId);
    if (!message) {
      throw ApiError.notFound('Message');
    }

    if (message.destinataireId !== proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à marquer ce message comme lu');
    }

    await this.messageRepository.markAsRead(messageId, proprietaireId);
  }
}
