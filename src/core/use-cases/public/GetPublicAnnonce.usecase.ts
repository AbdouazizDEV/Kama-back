import { IAnnonceRepository } from '../../domain/repositories/IAnnonceRepository';
import { Annonce } from '../../domain/entities/Annonce.entity';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export interface GetPublicAnnonceInput {
  annonceId: string;
  incrementViews?: boolean;
}

export class GetPublicAnnonceUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: GetPublicAnnonceInput): Promise<Annonce> {
    const annonce = await this.annonceRepository.findById(input.annonceId);

    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    // Vérifier que l'annonce est publique (approuvée et disponible)
    if (annonce.statutModeration !== StatutModeration.APPROUVE || !annonce.estDisponible) {
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
