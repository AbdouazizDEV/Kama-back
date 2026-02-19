import { IPaiementRepository } from '../../domain/repositories/IPaiementRepository';
import { IPaymentService } from '../../domain/services/IPaymentService';
import { Paiement } from '../../domain/entities/Paiement.entity';
import { ApiError } from '@/shared/utils/ApiError';

export interface ValidatePaiementInput {
  paiementId: string;
  transactionId: string;
}

export class ValidatePaiementUseCase {
  constructor(
    private paiementRepository: IPaiementRepository,
    private paymentService: IPaymentService
  ) {}

  async execute(input: ValidatePaiementInput): Promise<Paiement> {
    const paiement = await this.paiementRepository.findById(input.paiementId);
    if (!paiement) {
      throw ApiError.notFound('Paiement');
    }

    // Vérifier le paiement via le service de paiement
    const isValid = await this.paymentService.validatePayment(input.transactionId);
    if (!isValid) {
      paiement.fail('Validation échouée par le service de paiement');
      await this.paiementRepository.update(paiement);
      throw ApiError.badRequest('Le paiement n\'a pas pu être validé');
    }

    paiement.validate();
    await this.paiementRepository.update(paiement);

    return paiement;
  }
}
