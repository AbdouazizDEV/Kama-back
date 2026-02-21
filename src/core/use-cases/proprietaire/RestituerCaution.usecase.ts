import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { StatutReservation } from '@/shared/constants/statuses.constant';
import { StatutPaiement } from '@/shared/constants/statuses.constant';
import { Paiement } from '@/core/domain/entities/Paiement.entity';
import { Prix } from '@/core/domain/value-objects/Prix.vo';
import { randomUUID } from 'crypto';

export interface RestituerCautionInput {
  reservationId: string;
  proprietaireId: string;
  referenceTransaction?: string;
}

export class RestituerCautionProprietaireUseCase {
  constructor(
    private paiementRepository: IPaiementRepository,
    private userRepository: IUserRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(input: RestituerCautionInput): Promise<Paiement> {
    const proprietaire = await this.userRepository.findById(input.proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const reservation = await this.reservationRepository.findById(input.reservationId);
    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    if (reservation.proprietaireId !== input.proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à restituer cette caution');
    }

    if (reservation.statut !== StatutReservation.TERMINEE) {
      throw ApiError.conflict('La réservation doit être terminée pour restituer la caution');
    }

    // Vérifier qu'il n'y a pas déjà un remboursement
    const paiements = await this.paiementRepository.findByReservation(input.reservationId);
    const remboursementExistant = paiements.find(
      (p) => p.montant.getMontant() === reservation.caution.getMontant() && p.statut === StatutPaiement.VALIDE
    );

    if (remboursementExistant) {
      throw ApiError.conflict('La caution a déjà été restituée');
    }

    // Créer un paiement de remboursement (montant négatif ou nouveau paiement avec statut REMBOURSE)
    const remboursement = new Paiement(
      randomUUID(),
      input.reservationId,
      reservation.locataireId,
      input.proprietaireId,
      reservation.caution,
      'AIRTEL_MONEY', // Par défaut, peut être modifié
      new Date(),
      new Date(),
      StatutPaiement.EN_ATTENTE,
      input.referenceTransaction || null,
      null,
      null
    );

    await this.paiementRepository.save(remboursement);
    return remboursement;
  }
}
