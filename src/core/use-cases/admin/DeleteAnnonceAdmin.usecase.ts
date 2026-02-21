import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class DeleteAnnonceAdminUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(annonceId: string): Promise<void> {
    const annonce = await this.annonceRepository.findById(annonceId);

    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    await this.annonceRepository.delete(annonceId);
  }
}
