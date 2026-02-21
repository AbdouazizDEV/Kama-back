import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { Message } from '@/core/domain/entities/Message.entity';
import { validatePaginationParams, calculatePagination } from '@/shared/utils/pagination';

export interface GetFlaggedMessagesInput {
  page?: number;
  limit?: number;
}

export interface GetFlaggedMessagesOutput {
  data: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class GetFlaggedMessagesUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(input: GetFlaggedMessagesInput): Promise<GetFlaggedMessagesOutput> {
    const { page, limit } = validatePaginationParams(input.page, input.limit);

    const flaggedMessages = await this.messageRepository.findFlagged();

    const total = flaggedMessages.length;
    const { skip, totalPages } = calculatePagination(page, limit, total);
    const paginated = flaggedMessages.slice(skip, skip + limit);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
