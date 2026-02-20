import { IAvisRepository } from '@/core/domain/repositories/IAvisRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { Avis } from '@/core/domain/entities/Avis.entity';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutReservation } from '@/shared/constants/statuses.constant';
import { randomUUID } from 'crypto';

export interface CreateAvisInput {
  reservationId: string;
  locataireId: string;
  note: number;
  commentaire: string;
}

export class CreateAvisUseCase {
  constructor(
    private avisRepository: IAvisRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(input: CreateAvisInput) {
    // Vérifier que la réservation existe
    const reservation = await this.reservationRepository.findById(input.reservationId);
    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    // Vérifier que la réservation appartient au locataire
    if (reservation.locataireId !== input.locataireId) {
      throw ApiError.forbidden('Vous n\'avez pas accès à cette réservation');
    }

    // Vérifier que la réservation est terminée
    if (reservation.statut !== StatutReservation.TERMINEE) {
      throw ApiError.conflict('Vous ne pouvez laisser un avis que pour une réservation terminée');
    }

    // Vérifier qu'un avis n'existe pas déjà
    const existingAvis = await this.avisRepository.findByReservation(input.reservationId);
    if (existingAvis) {
      throw ApiError.conflict('Un avis existe déjà pour cette réservation');
    }

    // Créer l'avis
    const avis = new Avis(
      randomUUID(),
      input.reservationId,
      input.locataireId,
      reservation.proprietaireId,
      input.note,
      input.commentaire,
      new Date(),
      new Date()
    );

    await this.avisRepository.save(avis);

    return avis;
  }
}
