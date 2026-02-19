import { IPaiementRepository } from '../../domain/repositories/IPaiementRepository';
import { IPaymentService } from '../../domain/services/IPaymentService';
import { Paiement } from '../../domain/entities/Paiement.entity';
import { ApiError } from '@/shared/utils/ApiError';

export interface RefundPaiementInput {
  paiementId: string;
  proprietaireId: string;
}

export class RefundPaiementUseCase {
  constructor(
    private paiementRepository: IPaiementRepository,
    private paymentService: IPaymentService
  ) {}

  async execute(input: RefundPaiementInput): Promise<Paiement> {
    const paiement = await this.paiementRepository.findById(input.paiementId);
    if (!paiement) {
      throw ApiError.notFound('Paiement');
    }

    // Vérifier que c'est le propriétaire
    if (paiement.proprietaireId !== input.proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à rembourser ce paiement');
    }

    // Vérifier que le paiement est validé
    if (paiement.statut !== 'VALIDE') {
      throw ApiError.conflict('Seuls les paiements validés peuvent être remboursés');
    }

    if (!paiement.referenceTransaction) {
      throw ApiError.badRequest('Référence de transaction manquante');
    }

    // Effectuer le remboursement via le service de paiement
    const refundSuccess = await this.paymentService.refundPayment(
      paiement.referenceTransaction,
      paiement.montant
    );

    if (!refundSuccess) {
      throw ApiError.internal('Le remboursement a échoué');
    }

    paiement.refund();
    await this.paiementRepository.update(paiement);

    return paiement;
  }
}
