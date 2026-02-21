import { ILitigeRepository } from '@/core/domain/repositories/ILitigeRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutLitige } from '@/core/domain/entities/Litige.entity';

export interface ResolveLitigeInput {
  litigeId: string;
  resolution: string;
  statut: 'RESOLU' | 'FERME';
}

export class ResolveLitigeUseCase {
  constructor(private litigeRepository: ILitigeRepository) {}

  async execute(input: ResolveLitigeInput): Promise<void> {
    const litige = await this.litigeRepository.findById(input.litigeId);

    if (!litige) {
      throw ApiError.notFound('Litige');
    }

    if (input.statut === 'RESOLU') {
      litige.resolve(input.resolution);
    } else if (input.statut === 'FERME') {
      litige.close();
    }

    await this.litigeRepository.update(litige);
  }
}
