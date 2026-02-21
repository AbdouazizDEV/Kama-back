import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { Message } from '@/core/domain/entities/Message.entity';
import { validatePaginationParams, calculatePagination } from '@/shared/utils/pagination';

export interface ListMessagesAdminInput {
  page?: number;
  limit?: number;
  reservationId?: string;
  expediteurId?: string;
  destinataireId?: string;
}

export interface ListMessagesAdminOutput {
  data: Message[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListMessagesAdminUseCase {
  constructor(private messageRepository: IMessageRepository) {}

  async execute(input: ListMessagesAdminInput): Promise<ListMessagesAdminOutput> {
    const { page, limit } = validatePaginationParams(input.page, input.limit);

    // Récupérer tous les messages
    const allMessages = await this.messageRepository.findAll();

    // Appliquer les filtres
    let filtered = allMessages;

    if (input.reservationId) {
      filtered = filtered.filter((m) => m.reservationId === input.reservationId);
    }
    if (input.expediteurId) {
      filtered = filtered.filter((m) => m.expediteurId === input.expediteurId);
    }
    if (input.destinataireId) {
      filtered = filtered.filter((m) => m.destinataireId === input.destinataireId);
    }

    // Trier par date d'envoi (plus récents en premier)
    filtered.sort((a, b) => b.dateEnvoi.getTime() - a.dateEnvoi.getTime());

    const total = filtered.length;
    const { skip, totalPages } = calculatePagination(page, limit, total);
    const paginated = filtered.slice(skip, skip + limit);

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
