import { Etudiant } from '../entities/Etudiant.entity';

export interface IEtudiantRepository {
  findByUserId(userId: string): Promise<Etudiant | null>;
  save(etudiant: Etudiant): Promise<void>;
  update(etudiant: Etudiant): Promise<void>;
}
