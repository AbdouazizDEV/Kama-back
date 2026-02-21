import { Litige } from '../entities/Litige.entity';

export interface ILitigeRepository {
  findById(id: string): Promise<Litige | null>;
  findAll(filters?: LitigeFilters): Promise<Litige[]>;
  save(litige: Litige): Promise<void>;
  update(litige: Litige): Promise<void>;
}

export interface LitigeFilters {
  statut?: string;
  type?: string;
  locataireId?: string;
  proprietaireId?: string;
}
