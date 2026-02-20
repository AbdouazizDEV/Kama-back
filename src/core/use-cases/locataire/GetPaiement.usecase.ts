import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class GetPaiementUseCase {
  constructor(private paiementRepository: IPaiementRepository) {}

  async execute(paiementId: string, locataireId: string) {
    const paiement = await this.paiementRepository.findById(paiementId);

    if (!paiement) {
      throw ApiError.notFound('Paiement');
    }

    // Vérifier que le paiement appartient au locataire
    if (paiement.locataireId !== locataireId) {
      throw ApiError.forbidden('Vous n\'avez pas accès à ce paiement');
    }

    return {
      id: paiement.id,
      reservationId: paiement.reservationId,
      montant: paiement.montant.getMontant(),
      methodePaiement: paiement.methodePaiement,
      statut: paiement.statut,
      referenceTransaction: paiement.referenceTransaction,
      dateCreation: paiement.dateCreation,
      dateValidation: paiement.dateValidation,
      motifEchec: paiement.motifEchec,
    };
  }
}
