import { Colocation } from '../entities/Colocation.entity';
import { CandidatureColocation } from '../entities/CandidatureColocation.entity';

export interface IColocationRepository {
  findById(id: string): Promise<Colocation | null>;
  findByAnnonceId(annonceId: string): Promise<Colocation | null>;
  findActive(): Promise<Colocation[]>;
  findByCriteres(criteres: {
    ville?: string;
    nombrePlacesMin?: number;
    placesDisponibles?: boolean;
  }): Promise<Colocation[]>;
  save(colocation: Colocation): Promise<void>;
  update(colocation: Colocation): Promise<void>;
  findCandidaturesByColocationId(colocationId: string): Promise<CandidatureColocation[]>;
  findCandidaturesByCandidatId(candidatId: string): Promise<CandidatureColocation[]>;
  findCandidatureById(id: string): Promise<CandidatureColocation | null>;
  findCandidatureByColocationAndCandidat(
    colocationId: string,
    candidatId: string
  ): Promise<CandidatureColocation | null>;
  saveCandidature(candidature: CandidatureColocation): Promise<void>;
  updateCandidature(candidature: CandidatureColocation): Promise<void>;
}
