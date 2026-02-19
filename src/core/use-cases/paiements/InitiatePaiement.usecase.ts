import { IPaiementRepository } from '../../domain/repositories/IPaiementRepository';
import { IReservationRepository } from '../../domain/repositories/IReservationRepository';
import { IPaymentService } from '../../domain/services/IPaymentService';
import { Paiement, MethodePaiement } from '../../domain/entities/Paiement.entity';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutPaiement } from '@/shared/constants/statuses.constant';
import { randomUUID } from 'crypto';

export interface InitiatePaiementInput {
  reservationId: string;
  methodePaiement: MethodePaiement;
  locataireId: string;
}

export class InitiatePaiementUseCase {
  constructor(
    private paiementRepository: IPaiementRepository,
    private reservationRepository: IReservationRepository,
    private paymentService: IPaymentService
  ) {}

  async execute(input: InitiatePaiementInput): Promise<Paiement> {
    // Vérifier que la réservation existe
    const reservation = await this.reservationRepository.findById(input.reservationId);
    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    // Vérifier que c'est le locataire
    if (reservation.locataireId !== input.locataireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à payer cette réservation');
    }

    // Vérifier que la réservation est acceptée
    if (reservation.statut !== 'ACCEPTEE') {
      throw ApiError.conflict('La réservation doit être acceptée avant le paiement');
    }

    // Vérifier qu'il n'y a pas déjà un paiement validé
    const existingPayments = await this.paiementRepository.findByReservation(input.reservationId);
    const hasValidPayment = existingPayments.some((p) => p.statut === StatutPaiement.VALIDE);
    if (hasValidPayment) {
      throw ApiError.conflict('Cette réservation a déjà été payée');
    }

    // Initier le paiement via le service de paiement
    const paymentResult = await this.paymentService.initiatePayment(
      reservation.prixTotal,
      input.methodePaiement,
      {
        reservationId: input.reservationId,
        locataireId: input.locataireId,
        proprietaireId: reservation.proprietaireId,
        description: `Paiement réservation ${input.reservationId}`,
      }
    );

    // Créer l'entité Paiement
    const paiement = new Paiement(
      randomUUID(),
      input.reservationId,
      input.locataireId,
      reservation.proprietaireId,
      reservation.prixTotal,
      input.methodePaiement,
      new Date(),
      new Date(),
      StatutPaiement.EN_ATTENTE,
      paymentResult.transactionId
    );

    await this.paiementRepository.save(paiement);

    return paiement;
  }
}
