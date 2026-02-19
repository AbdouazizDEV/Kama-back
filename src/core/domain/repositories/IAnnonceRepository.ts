import { Annonce } from '../entities/Annonce.entity';

export interface IAnnonceRepository {
  findById(id: string): Promise<Annonce | null>;
  findByProprietaire(proprietaireId: string): Promise<Annonce[]>;
  save(annonce: Annonce): Promise<void>;
  update(annonce: Annonce): Promise<void>;
  delete(id: string): Promise<void>;
  search(criteria: SearchCriteria): Promise<{ data: Annonce[]; total: number }>;
  incrementViews(id: string): Promise<void>;
}

export interface SearchCriteria {
  typeBien?: string;
  ville?: string;
  quartier?: string;
  prixMin?: number;
  prixMax?: number;
  nombrePiecesMin?: number;
  superficieMin?: number;
  estMeuble?: boolean;
  equipements?: string[];
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
