import { Reservation } from '../entities/Reservation.entity';

export interface IReservationRepository {
  findById(id: string): Promise<Reservation | null>;
  findByLocataire(locataireId: string): Promise<Reservation[]>;
  findByProprietaire(proprietaireId: string): Promise<Reservation[]>;
  findByAnnonce(annonceId: string): Promise<Reservation[]>;
  save(reservation: Reservation): Promise<void>;
  update(reservation: Reservation): Promise<void>;
  delete(id: string): Promise<void>;
  findConflictingReservations(
    annonceId: string,
    dateDebut: Date,
    dateFin: Date,
    excludeReservationId?: string
  ): Promise<Reservation[]>;
}
