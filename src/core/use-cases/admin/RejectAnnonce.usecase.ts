import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export interface RejectAnnonceInput {
  annonceId: string;
  motif: string;
}

export class RejectAnnonceUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: RejectAnnonceInput): Promise<void> {
    const annonce = await this.annonceRepository.findById(input.annonceId);

    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    if (annonce.statutModeration === StatutModeration.REJETE) {
      throw ApiError.conflict('L\'annonce est déjà rejetée');
    }

    annonce.reject();
    await this.annonceRepository.update(annonce);

    // TODO: Stocker le motif de rejet si nécessaire (ajouter un champ dans l'entité)
  }
}
