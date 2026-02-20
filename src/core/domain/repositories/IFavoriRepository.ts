import { Favori } from '../entities/Favori.entity';

export interface IFavoriRepository {
  findById(id: string): Promise<Favori | null>;
  findByUser(userId: string): Promise<Favori[]>;
  findByUserAndAnnonce(userId: string, annonceId: string): Promise<Favori | null>;
  save(favori: Favori): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByUserAndAnnonce(userId: string, annonceId: string): Promise<void>;
  countByUser(userId: string): Promise<number>;
}
