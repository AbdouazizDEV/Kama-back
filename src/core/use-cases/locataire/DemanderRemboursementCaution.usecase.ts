import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutReservation } from '@/shared/constants/statuses.constant';

export class DemanderRemboursementCautionUseCase {
  constructor(
    private paiementRepository: IPaiementRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(reservationId: string, locataireId: string) {
    // Vérifier que la réservation existe
    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    // Vérifier que la réservation appartient au locataire
    if (reservation.locataireId !== locataireId) {
      throw ApiError.forbidden('Vous n\'avez pas accès à cette réservation');
    }

    // Vérifier que la réservation est terminée
    if (reservation.statut !== StatutReservation.TERMINEE) {
      throw ApiError.conflict('La réservation doit être terminée pour demander le remboursement');
    }

    // Récupérer les paiements de caution pour cette réservation
    const paiements = await this.paiementRepository.findByReservation(reservationId);
    const paiementCaution = paiements.find(
      (p) => p.montant.getMontant() === reservation.caution.getMontant()
    );

    if (!paiementCaution) {
      throw ApiError.notFound('Paiement de caution');
    }

    // TODO: Créer une demande de remboursement
    // Pour l'instant, on retourne juste une confirmation

    return {
      reservationId,
      montantCaution: reservation.caution.getMontant(),
      paiementId: paiementCaution.id,
      statut: 'DEMANDE_EN_COURS',
    };
  }
}
