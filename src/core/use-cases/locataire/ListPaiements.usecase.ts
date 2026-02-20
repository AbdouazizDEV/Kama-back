import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';

export class ListPaiementsUseCase {
  constructor(private paiementRepository: IPaiementRepository) {}

  async execute(locataireId: string) {
    const paiements = await this.paiementRepository.findByLocataire(locataireId);

    return paiements.map((paiement) => ({
      id: paiement.id,
      reservationId: paiement.reservationId,
      montant: paiement.montant.getMontant(),
      methodePaiement: paiement.methodePaiement,
      statut: paiement.statut,
      referenceTransaction: paiement.referenceTransaction,
      dateCreation: paiement.dateCreation,
      dateValidation: paiement.dateValidation,
      motifEchec: paiement.motifEchec,
    }));
  }
}
