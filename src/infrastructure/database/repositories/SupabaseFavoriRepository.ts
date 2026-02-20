import { IFavoriRepository } from '@/core/domain/repositories/IFavoriRepository';
import { Favori } from '@/core/domain/entities/Favori.entity';
import { supabase } from '../supabase.client';

export class SupabaseFavoriRepository implements IFavoriRepository {
  async findById(id: string): Promise<Favori | null> {
    const { data, error } = await supabase
      .from('favoris')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByUser(userId: string): Promise<Favori[]> {
    const { data, error } = await supabase
      .from('favoris')
      .select('*')
      .eq('userId', userId)
      .order('date_ajout', { ascending: false });

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async findByUserAndAnnonce(userId: string, annonceId: string): Promise<Favori | null> {
    const { data, error } = await supabase
      .from('favoris')
      .select('*')
      .eq('userId', userId)
      .eq('annonceId', annonceId)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async save(favori: Favori): Promise<void> {
    const { error } = await supabase.from('favoris').insert([this.mapToDatabase(favori)]);

    if (error) {
      throw new Error(`Erreur lors de la sauvegarde: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('favoris').delete().eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  async deleteByUserAndAnnonce(userId: string, annonceId: string): Promise<void> {
    const { error } = await supabase
      .from('favoris')
      .delete()
      .eq('userId', userId)
      .eq('annonceId', annonceId);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  async countByUser(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('favoris')
      .select('*', { count: 'exact', head: true })
      .eq('userId', userId);

    if (error) return 0;

    return count || 0;
  }

  private mapToEntity(data: any): Favori {
    return new Favori(
      data.id,
      data.userId || data.user_id,
      data.annonceId || data.annonce_id,
      new Date(data.dateAjout || data.date_ajout)
    );
  }

  private mapToDatabase(favori: Favori): any {
    return {
      id: favori.id,
      userId: favori.userId,
      annonceId: favori.annonceId,
      dateAjout: favori.dateAjout.toISOString(),
    };
  }
}
