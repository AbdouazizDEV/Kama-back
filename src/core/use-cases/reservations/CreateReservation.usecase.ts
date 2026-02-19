import { IReservationRepository } from '../../domain/repositories/IReservationRepository';
import { IAnnonceRepository } from '../../domain/repositories/IAnnonceRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Reservation } from '../../domain/entities/Reservation.entity';
import { Prix } from '../../domain/value-objects/Prix.vo';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutReservation } from '@/shared/constants/statuses.constant';
import { randomUUID } from 'crypto';

export interface CreateReservationInput {
  annonceId: string;
  locataireId: string;
  dateDebut: Date;
  dateFin: Date;
  nombrePersonnes: number;
  message?: string;
}

export class CreateReservationUseCase {
  constructor(
    private reservationRepository: IReservationRepository,
    private annonceRepository: IAnnonceRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: CreateReservationInput): Promise<Reservation> {
    // Vérifier que l'annonce existe
    const annonce = await this.annonceRepository.findById(input.annonceId);
    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    // Vérifier que l'annonce est disponible
    if (!annonce.estDisponible) {
      throw ApiError.conflict('Cette annonce n\'est pas disponible');
    }

    // Vérifier que le locataire existe
    const locataire = await this.userRepository.findById(input.locataireId);
    if (!locataire) {
      throw ApiError.notFound('Locataire');
    }

    // Vérifier qu'on ne réserve pas sa propre annonce
    if (annonce.proprietaireId === input.locataireId) {
      throw ApiError.forbidden('Vous ne pouvez pas réserver votre propre annonce');
    }

    // Vérifier qu'il n'y a pas de conflit de dates
    const conflictingReservations = await this.reservationRepository.findConflictingReservations(
      input.annonceId,
      input.dateDebut,
      input.dateFin
    );

    if (conflictingReservations.length > 0) {
      throw ApiError.conflict('Ces dates sont déjà réservées');
    }

    // Calculer le prix total
    const dureeJours = Math.ceil(
      (input.dateFin.getTime() - input.dateDebut.getTime()) / (1000 * 60 * 60 * 24)
    );
    const prixTotal = annonce.prix.multiply(dureeJours);

    // Créer la réservation
    const reservation = new Reservation(
      randomUUID(),
      input.annonceId,
      input.locataireId,
      annonce.proprietaireId,
      input.dateDebut,
      input.dateFin,
      input.nombrePersonnes,
      prixTotal,
      annonce.caution,
      input.message || null,
      new Date(),
      new Date(),
      StatutReservation.EN_ATTENTE
    );

    await this.reservationRepository.save(reservation);
    return reservation;
  }
}
