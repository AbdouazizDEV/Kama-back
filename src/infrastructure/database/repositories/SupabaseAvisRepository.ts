import { IAvisRepository } from '@/core/domain/repositories/IAvisRepository';
import { Avis } from '@/core/domain/entities/Avis.entity';
import { supabase } from '../supabase.client';

export class SupabaseAvisRepository implements IAvisRepository {
  async findById(id: string): Promise<Avis | null> {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByReservation(reservationId: string): Promise<Avis | null> {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .eq('reservationId', reservationId)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByLocataire(locataireId: string): Promise<Avis[]> {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .eq('locataireId', locataireId)
      .order('dateCreation', { ascending: false });

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async findByProprietaire(proprietaireId: string): Promise<Avis[]> {
    const { data, error } = await supabase
      .from('avis')
      .select('*')
      .eq('proprietaireId', proprietaireId)
      .order('dateCreation', { ascending: false });

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async save(avis: Avis): Promise<void> {
    const { error } = await supabase.from('avis').insert([this.mapToDatabase(avis)]);

    if (error) {
      throw new Error(`Erreur lors de la sauvegarde: ${error.message}`);
    }
  }

  async update(avis: Avis): Promise<void> {
    const { error } = await supabase
      .from('avis')
      .update(this.mapToDatabase(avis))
      .eq('id', avis.id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('avis').delete().eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  private mapToEntity(data: any): Avis {
    return new Avis(
      data.id,
      data.reservationId || data.reservation_id,
      data.locataireId || data.locataire_id,
      data.proprietaireId || data.proprietaire_id,
      data.note,
      data.commentaire,
      new Date(data.dateCreation || data.date_creation),
      new Date(data.dateModification || data.date_modification)
    );
  }

  private mapToDatabase(avis: Avis): any {
    return {
      id: avis.id,
      reservationId: avis.reservationId,
      locataireId: avis.locataireId,
      proprietaireId: avis.proprietaireId,
      note: avis.note,
      commentaire: avis.commentaire,
      dateCreation: avis.dateCreation.toISOString(),
      dateModification: avis.dateModification.toISOString(),
    };
  }
}
