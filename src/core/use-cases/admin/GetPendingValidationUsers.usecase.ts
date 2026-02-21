import { IUserRepository, UserFilters } from '@/core/domain/repositories/IUserRepository';
import { User } from '@/core/domain/entities/User.entity';
import { validatePaginationParams, calculatePagination } from '@/shared/utils/pagination';

export interface GetPendingValidationUsersInput {
  page?: number;
  limit?: number;
}

export interface GetPendingValidationUsersOutput {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class GetPendingValidationUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: GetPendingValidationUsersInput): Promise<GetPendingValidationUsersOutput> {
    const { page, limit } = validatePaginationParams(input.page, input.limit);

    const filters: UserFilters = {
      estVerifie: false,
    };

    const total = await this.userRepository.count(filters);
    const { skip, totalPages } = calculatePagination(page, limit, total);

    const allUsers = await this.userRepository.findAll(filters);
    const paginatedUsers = allUsers.slice(skip, skip + limit);

    return {
      data: paginatedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };
  }
}
