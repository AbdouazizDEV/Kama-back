import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class GetAnnonceDetailAdminUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(annonceId: string) {
    const annonce = await this.annonceRepository.findById(annonceId);

    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    return annonce;
  }
}
