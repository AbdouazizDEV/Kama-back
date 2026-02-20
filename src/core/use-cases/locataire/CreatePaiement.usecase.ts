import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { Paiement, MethodePaiement } from '@/core/domain/entities/Paiement.entity';
import { Prix } from '@/core/domain/value-objects/Prix.vo';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutPaiement } from '@/shared/constants/statuses.constant';
import { randomUUID } from 'crypto';

export interface CreatePaiementInput {
  reservationId: string;
  locataireId: string;
  methodePaiement: MethodePaiement;
  montant: number;
  referenceTransaction?: string;
}

export class CreatePaiementUseCase {
  constructor(
    private paiementRepository: IPaiementRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(input: CreatePaiementInput) {
    // Vérifier que la réservation existe
    const reservation = await this.reservationRepository.findById(input.reservationId);
    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    // Vérifier que la réservation appartient au locataire
    if (reservation.locataireId !== input.locataireId) {
      throw ApiError.forbidden('Vous n\'avez pas accès à cette réservation');
    }

    // Vérifier que la réservation est acceptée
    if (reservation.statut !== 'ACCEPTEE') {
      throw ApiError.conflict('La réservation doit être acceptée pour effectuer un paiement');
    }

    // Créer le paiement
    const paiement = new Paiement(
      randomUUID(),
      input.reservationId,
      input.locataireId,
      reservation.proprietaireId,
      new Prix(input.montant),
      input.methodePaiement,
      new Date(),
      new Date(),
      StatutPaiement.EN_ATTENTE,
      input.referenceTransaction || null,
      null,
      null
    );

    await this.paiementRepository.save(paiement);

    return paiement;
  }
}
