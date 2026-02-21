import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class DeleteMessageAdminUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(messageId: string): Promise<void> {
    const message = await this.messageRepository.findById(messageId);

    if (!message) {
      throw ApiError.notFound('Message');
    }

    await this.messageRepository.delete(messageId);
  }
}
