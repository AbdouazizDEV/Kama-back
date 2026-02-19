import { Paiement } from '../entities/Paiement.entity';

export interface IPaiementRepository {
  findById(id: string): Promise<Paiement | null>;
  findByReservation(reservationId: string): Promise<Paiement[]>;
  findByLocataire(locataireId: string): Promise<Paiement[]>;
  findByProprietaire(proprietaireId: string): Promise<Paiement[]>;
  save(paiement: Paiement): Promise<void>;
  update(paiement: Paiement): Promise<void>;
  delete(id: string): Promise<void>;
}
