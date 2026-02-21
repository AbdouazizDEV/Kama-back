import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export interface FeatureAnnonceInput {
  annonceId: string;
  featured: boolean;
}

export class FeatureAnnonceUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: FeatureAnnonceInput): Promise<void> {
    const annonce = await this.annonceRepository.findById(input.annonceId);

    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    if (annonce.statutModeration !== StatutModeration.APPROUVE) {
      throw ApiError.conflict('Seules les annonces approuvées peuvent être mises en avant');
    }

    // TODO: Ajouter un champ `featured` dans l'entité Annonce si nécessaire
    // Pour l'instant, on peut utiliser un champ dans la base de données
    // annonce.setFeatured(input.featured);
    // await this.annonceRepository.update(annonce);
  }
}
