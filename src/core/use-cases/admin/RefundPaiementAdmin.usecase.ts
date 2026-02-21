import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutPaiement } from '@/shared/constants/statuses.constant';

export interface RefundPaiementAdminInput {
  paiementId: string;
  motif: string;
  montant?: number;
}

export class RefundPaiementAdminUseCase {
  constructor(private paiementRepository: IPaiementRepository) {}

  async execute(input: RefundPaiementAdminInput): Promise<void> {
    const paiement = await this.paiementRepository.findById(input.paiementId);

    if (!paiement) {
      throw ApiError.notFound('Paiement');
    }

    if (paiement.statut !== StatutPaiement.VALIDE) {
      throw ApiError.conflict('Seuls les paiements validés peuvent être remboursés');
    }

    // Créer un nouveau paiement de remboursement ou marquer comme remboursé
    paiement.refund();
    await this.paiementRepository.update(paiement);

    // TODO: Stocker le motif de remboursement si nécessaire
  }
}
