import { ILitigeRepository } from '@/core/domain/repositories/ILitigeRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class GetLitigeDetailUseCase {
  constructor(private litigeRepository: ILitigeRepository) {}

  async execute(litigeId: string) {
    const litige = await this.litigeRepository.findById(litigeId);

    if (!litige) {
      throw ApiError.notFound('Litige');
    }

    return litige;
  }
}
