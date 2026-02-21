import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export class ApproveAnnonceUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(annonceId: string): Promise<void> {
    const annonce = await this.annonceRepository.findById(annonceId);

    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    if (annonce.statutModeration === StatutModeration.APPROUVE) {
      throw ApiError.conflict('L\'annonce est déjà approuvée');
    }

    annonce.approve();
    annonce.markAsAvailable();
    await this.annonceRepository.update(annonce);
  }
}
