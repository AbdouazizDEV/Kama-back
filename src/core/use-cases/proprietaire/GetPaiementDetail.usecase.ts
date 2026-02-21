import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class GetPaiementDetailProprietaireUseCase {
  constructor(
    private paiementRepository: IPaiementRepository,
    private userRepository: IUserRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(paiementId: string, proprietaireId: string) {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const paiement = await this.paiementRepository.findById(paiementId);
    if (!paiement) {
      throw ApiError.notFound('Paiement');
    }

    if (paiement.proprietaireId !== proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à consulter ce paiement');
    }

    const reservation = await this.reservationRepository.findById(paiement.reservationId);

    return {
      id: paiement.id,
      reservation: reservation
        ? {
            id: reservation.id,
            dateDebut: reservation.dateDebut,
            dateFin: reservation.dateFin,
          }
        : null,
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
