import { IColocationRepository } from '@/core/domain/repositories/IColocationRepository';
import { Colocation } from '@/core/domain/entities/Colocation.entity';
import { CandidatureColocation, StatutCandidature } from '@/core/domain/entities/CandidatureColocation.entity';
import { supabase } from '../supabase.client';

export class SupabaseColocationRepository implements IColocationRepository {
  async findById(id: string): Promise<Colocation | null> {
    const { data, error } = await supabase
      .from('colocations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByAnnonceId(annonceId: string): Promise<Colocation | null> {
    const { data, error } = await supabase
      .from('colocations')
      .select('*')
      .eq('annonceId', annonceId)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findActive(): Promise<Colocation[]> {
    const { data, error } = await supabase
      .from('colocations')
      .select('*')
      .eq('estActive', true);

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async findByCriteres(criteres: {
    ville?: string;
    nombrePlacesMin?: number;
    placesDisponibles?: boolean;
  }): Promise<Colocation[]> {
    let query = supabase.from('colocations').select('*, annonces!inner(*)');

    if (criteres.ville) {
      query = query.eq('annonces.ville', criteres.ville);
    }

    if (criteres.nombrePlacesMin !== undefined) {
      query = query.gte('nombrePlaces', criteres.nombrePlacesMin);
    }

    if (criteres.placesDisponibles) {
      query = query.gt('placesDisponibles', 0);
    }

    query = query.eq('estActive', true);

    const { data, error } = await query;

    if (error || !data) return [];

    return data.map((item: any) => this.mapToEntity(item));
  }

  async save(colocation: Colocation): Promise<void> {
    const { error } = await supabase.from('colocations').insert({
      id: colocation.id,
      annonceId: colocation.annonceId,
      nombrePlaces: colocation.nombrePlaces,
      placesDisponibles: colocation.placesDisponibles,
      description: colocation.description,
      regles: colocation.regles,
      estActive: colocation.estActive,
    });

    if (error) {
      throw new Error(`Erreur lors de la sauvegarde de la colocation: ${error.message}`);
    }
  }

  async update(colocation: Colocation): Promise<void> {
    const { error } = await supabase
      .from('colocations')
      .update({
        placesDisponibles: colocation.placesDisponibles,
        description: colocation.description,
        regles: colocation.regles,
        estActive: colocation.estActive,
        dateModification: new Date().toISOString(),
      })
      .eq('id', colocation.id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la colocation: ${error.message}`);
    }
  }

  async findCandidaturesByColocationId(colocationId: string): Promise<CandidatureColocation[]> {
    const { data, error } = await supabase
      .from('candidatures_colocation')
      .select('*')
      .eq('colocationId', colocationId)
      .order('dateCreation', { ascending: false });

    if (error || !data) return [];

    return data.map((item) => this.mapCandidatureToEntity(item));
  }

  async findCandidaturesByCandidatId(candidatId: string): Promise<CandidatureColocation[]> {
    const { data, error } = await supabase
      .from('candidatures_colocation')
      .select('*')
      .eq('candidatId', candidatId)
      .order('dateCreation', { ascending: false });

    if (error || !data) return [];

    return data.map((item) => this.mapCandidatureToEntity(item));
  }

  async findCandidatureById(id: string): Promise<CandidatureColocation | null> {
    const { data, error } = await supabase
      .from('candidatures_colocation')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapCandidatureToEntity(data);
  }

  async findCandidatureByColocationAndCandidat(
    colocationId: string,
    candidatId: string
  ): Promise<CandidatureColocation | null> {
    const { data, error } = await supabase
      .from('candidatures_colocation')
      .select('*')
      .eq('colocationId', colocationId)
      .eq('candidatId', candidatId)
      .single();

    if (error || !data) return null;

    return this.mapCandidatureToEntity(data);
  }

  async saveCandidature(candidature: CandidatureColocation): Promise<void> {
    const { error } = await supabase.from('candidatures_colocation').insert({
      id: candidature.id,
      colocationId: candidature.colocationId,
      candidatId: candidature.candidatId,
      message: candidature.message,
      statut: candidature.statut,
    });

    if (error) {
      throw new Error(`Erreur lors de la sauvegarde de la candidature: ${error.message}`);
    }
  }

  async updateCandidature(candidature: CandidatureColocation): Promise<void> {
    const { error } = await supabase
      .from('candidatures_colocation')
      .update({
        message: candidature.message,
        statut: candidature.statut,
        dateModification: new Date().toISOString(),
      })
      .eq('id', candidature.id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de la candidature: ${error.message}`);
    }
  }

  private mapToEntity(data: any): Colocation {
    return new Colocation(
      data.id,
      data.annonceId,
      data.nombrePlaces,
      data.placesDisponibles,
      data.description,
      data.regles || [],
      data.estActive,
      new Date(data.dateCreation),
      new Date(data.dateModification)
    );
  }

  private mapCandidatureToEntity(data: any): CandidatureColocation {
    return new CandidatureColocation(
      data.id,
      data.colocationId,
      data.candidatId,
      data.message,
      data.statut as StatutCandidature,
      new Date(data.dateCreation),
      new Date(data.dateModification)
    );
  }
}
