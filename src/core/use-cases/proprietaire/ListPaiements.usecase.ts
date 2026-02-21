import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class ListPaiementsProprietaireUseCase {
  constructor(
    private paiementRepository: IPaiementRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(proprietaireId: string) {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const paiements = await this.paiementRepository.findByProprietaire(proprietaireId);

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
