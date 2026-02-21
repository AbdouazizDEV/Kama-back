import { validatePaginationParams, calculatePagination } from '@/shared/utils/pagination';

export interface SystemLog {
  id: string;
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface GetSystemLogsInput {
  page?: number;
  limit?: number;
  level?: 'error' | 'warn' | 'info' | 'debug';
  dateDebut?: Date;
  dateFin?: Date;
}

export interface GetSystemLogsOutput {
  data: SystemLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class GetSystemLogsUseCase {
  async execute(input: GetSystemLogsInput): Promise<GetSystemLogsOutput> {
    const { page, limit } = validatePaginationParams(input.page, input.limit);

    // TODO: Implémenter la récupération des logs depuis un système de logging
    // Pour l'instant, retourner un tableau vide
    const logs: SystemLog[] = [];

    const total = logs.length;
    const { skip, totalPages } = calculatePagination(page, limit, total);
    const paginated = logs.slice(skip, skip + limit);

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
