import { Mutuelle } from '../entities/Mutuelle.entity';
import { Cotisation } from '../entities/Cotisation.entity';

export interface IMutuelleRepository {
  findByUserId(userId: string): Promise<Mutuelle | null>;
  findByNumeroAdhesion(numeroAdhesion: string): Promise<Mutuelle | null>;
  save(mutuelle: Mutuelle): Promise<void>;
  update(mutuelle: Mutuelle): Promise<void>;
  findCotisationsByMutuelleId(mutuelleId: string): Promise<Cotisation[]>;
  findCotisationByMutuelleIdAndMoisAnnee(
    mutuelleId: string,
    mois: number,
    annee: number
  ): Promise<Cotisation | null>;
  saveCotisation(cotisation: Cotisation): Promise<void>;
  updateCotisation(cotisation: Cotisation): Promise<void>;
}
