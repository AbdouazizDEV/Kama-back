import { IMutuelleRepository } from '@/core/domain/repositories/IMutuelleRepository';
import { Mutuelle } from '@/core/domain/entities/Mutuelle.entity';
import { Cotisation, StatutCotisation } from '@/core/domain/entities/Cotisation.entity';
import { Prix } from '@/core/domain/value-objects/Prix.vo';
import { supabase } from '../supabase.client';

export class SupabaseMutuelleRepository implements IMutuelleRepository {
  async findByUserId(userId: string): Promise<Mutuelle | null> {
    const { data, error } = await supabase
      .from('mutuelles')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByNumeroAdhesion(numeroAdhesion: string): Promise<Mutuelle | null> {
    const { data, error } = await supabase
      .from('mutuelles')
      .select('*')
      .eq('numeroAdhesion', numeroAdhesion)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async save(mutuelle: Mutuelle): Promise<void> {
    const { error } = await supabase.from('mutuelles').insert({
      id: mutuelle.id,
      userId: mutuelle.userId,
      numeroAdhesion: mutuelle.numeroAdhesion,
      dateAdhesion: mutuelle.dateAdhesion.toISOString(),
      dateResiliation: mutuelle.dateResiliation?.toISOString() || null,
      estActive: mutuelle.estActive,
      dateModification: mutuelle.dateModification.toISOString(),
    });

    if (error) {
      throw new Error(`Erreur lors de la sauvegarde de la mutuelle: ${error.message}`);
    }
  }

  async update(mutuelle: Mutuelle): Promise<void> {
    const { error } = await supabase
      .from('mutuelles')
      .update({
        dateResiliation: mutuelle.dateResiliation?.toISOString() || null,
        estActive: mutuelle.estActive,
        dateModification: new Date().toISOString(),
      })
      .eq('id', mutuelle.id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la mutuelle: ${error.message}`);
    }
  }

  async findCotisationsByMutuelleId(mutuelleId: string): Promise<Cotisation[]> {
    const { data, error } = await supabase
      .from('cotisations')
      .select('*')
      .eq('mutuelleId', mutuelleId)
      .order('annee', { ascending: false })
      .order('mois', { ascending: false });

    if (error || !data) return [];

    return data.map((item) => this.mapCotisationToEntity(item));
  }

  async findCotisationByMutuelleIdAndMoisAnnee(
    mutuelleId: string,
    mois: number,
    annee: number
  ): Promise<Cotisation | null> {
    const { data, error } = await supabase
      .from('cotisations')
      .select('*')
      .eq('mutuelleId', mutuelleId)
      .eq('mois', mois)
      .eq('annee', annee)
      .single();

    if (error || !data) return null;

    return this.mapCotisationToEntity(data);
  }

  async saveCotisation(cotisation: Cotisation): Promise<void> {
    const { error } = await supabase.from('cotisations').insert({
      id: cotisation.id,
      mutuelleId: cotisation.mutuelleId,
      montant: cotisation.montant.getMontant(),
      mois: cotisation.mois,
      annee: cotisation.annee,
      datePaiement: cotisation.datePaiement?.toISOString() || null,
      statut: cotisation.statut,
      referenceTransaction: cotisation.referenceTransaction,
      dateModification: cotisation.dateModification.toISOString(),
    });

    if (error) {
      throw new Error(`Erreur lors de la sauvegarde de la cotisation: ${error.message}`);
    }
  }

  async updateCotisation(cotisation: Cotisation): Promise<void> {
    const { error } = await supabase
      .from('cotisations')
      .update({
        datePaiement: cotisation.datePaiement?.toISOString() || null,
        statut: cotisation.statut,
        referenceTransaction: cotisation.referenceTransaction,
        dateModification: new Date().toISOString(),
      })
      .eq('id', cotisation.id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la cotisation: ${error.message}`);
    }
  }

  private mapToEntity(data: any): Mutuelle {
    return new Mutuelle(
      data.id,
      data.userId,
      data.numeroAdhesion,
      new Date(data.dateAdhesion),
      data.dateResiliation ? new Date(data.dateResiliation) : null,
      data.estActive,
      new Date(data.dateCreation),
      new Date(data.dateModification)
    );
  }

  private mapCotisationToEntity(data: any): Cotisation {
    return new Cotisation(
      data.id,
      data.mutuelleId,
      new Prix(Number(data.montant)),
      data.mois,
      data.annee,
      data.datePaiement ? new Date(data.datePaiement) : null,
      data.statut as StatutCotisation,
      data.referenceTransaction,
      new Date(data.dateCreation),
      new Date(data.dateModification)
    );
  }
}
