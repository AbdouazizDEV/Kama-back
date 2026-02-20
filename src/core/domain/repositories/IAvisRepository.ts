import { Avis } from '../entities/Avis.entity';

export interface IAvisRepository {
  findById(id: string): Promise<Avis | null>;
  findByReservation(reservationId: string): Promise<Avis | null>;
  findByLocataire(locataireId: string): Promise<Avis[]>;
  findByProprietaire(proprietaireId: string): Promise<Avis[]>;
  save(avis: Avis): Promise<void>;
  update(avis: Avis): Promise<void>;
  delete(id: string): Promise<void>;
}
