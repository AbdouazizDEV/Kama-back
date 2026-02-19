import { IAnnonceRepository, SearchCriteria } from '../../domain/repositories/IAnnonceRepository';
import { Annonce } from '../../domain/entities/Annonce.entity';

export interface SearchAnnoncesInput extends SearchCriteria {}

export interface SearchAnnoncesOutput {
  data: Annonce[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class SearchAnnoncesUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: SearchAnnoncesInput): Promise<SearchAnnoncesOutput> {
    const { data, total } = await this.annonceRepository.search(input);

    const page = input.page || 1;
    const limit = input.limit || 20;
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
    };
  }
}
