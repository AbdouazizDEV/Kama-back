import { IUserRepository, UserFilters } from '@/core/domain/repositories/IUserRepository';
import { User } from '@/core/domain/entities/User.entity';
import { validatePaginationParams, calculatePagination } from '@/shared/utils/pagination';

export interface ListUsersInput {
  page?: number;
  limit?: number;
  typeUtilisateur?: 'LOCATAIRE' | 'PROPRIETAIRE' | 'ETUDIANT' | 'ADMIN';
  estActif?: boolean;
  estVerifie?: boolean;
  search?: string;
}

export interface ListUsersOutput {
  data: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ListUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: ListUsersInput): Promise<ListUsersOutput> {
    const { page, limit } = validatePaginationParams(input.page, input.limit);

    const filters: UserFilters = {
      typeUtilisateur: input.typeUtilisateur,
      estActif: input.estActif,
      estVerifie: input.estVerifie,
      search: input.search,
    };

    const total = await this.userRepository.count(filters);
    const { skip, totalPages } = calculatePagination(page, limit, total);

    // Récupérer tous les utilisateurs avec filtres, puis paginer manuellement
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
