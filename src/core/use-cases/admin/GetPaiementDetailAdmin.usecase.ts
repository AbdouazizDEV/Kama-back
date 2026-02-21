import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class GetPaiementDetailAdminUseCase {
  constructor(private paiementRepository: IPaiementRepository) {}

  async execute(paiementId: string) {
    const paiement = await this.paiementRepository.findById(paiementId);

    if (!paiement) {
      throw ApiError.notFound('Paiement');
    }

    return paiement;
  }
}
