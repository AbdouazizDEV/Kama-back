import { IAnnonceRepository } from '../../domain/repositories/IAnnonceRepository';
import { Annonce } from '../../domain/entities/Annonce.entity';
import { ApiError } from '@/shared/utils/ApiError';

export interface GetAnnonceInput {
  annonceId: string;
  incrementViews?: boolean;
}

export class GetAnnonceUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: GetAnnonceInput): Promise<Annonce> {
    const annonce = await this.annonceRepository.findById(input.annonceId);
    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    // Incrémenter les vues si demandé
    if (input.incrementViews) {
      annonce.incrementViews();
      await this.annonceRepository.incrementViews(input.annonceId);
    }

    return annonce;
  }
}
