import {
  IAnnonceRepository,
  SearchCriteria,
} from '@/core/domain/repositories/IAnnonceRepository';
import { Annonce, TypeBien } from '@/core/domain/entities/Annonce.entity';
import { supabase } from '../supabase.client';
import { Prix } from '@/core/domain/value-objects/Prix.vo';
import { Adresse } from '@/core/domain/value-objects/Adresse.vo';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export class SupabaseAnnonceRepository implements IAnnonceRepository {
  async findById(id: string): Promise<Annonce | null> {
    const { data, error } = await supabase
      .from('annonces')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByProprietaire(proprietaireId: string): Promise<Annonce[]> {
    const { data, error } = await supabase
      .from('annonces')
      .select('*')
      .eq('proprietaireId', proprietaireId);

    if (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }

    return data ? data.map((item) => this.mapToEntity(item)) : [];
  }

  async save(annonce: Annonce): Promise<void> {
    const { error } = await supabase
      .from('annonces')
      .insert([this.mapToDatabase(annonce)]);

    if (error) {
      throw new Error(`Erreur lors de la sauvegarde: ${error.message}`);
    }
  }

  async update(annonce: Annonce): Promise<void> {
    const { error } = await supabase
      .from('annonces')
      .update(this.mapToDatabase(annonce))
      .eq('id', annonce.id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('annonces').delete().eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  async search(criteria: SearchCriteria): Promise<{ data: Annonce[]; total: number }> {
    let query = supabase.from('annonces').select('*', { count: 'exact' });

    if (criteria.typeBien) {
      query = query.eq('type_bien', criteria.typeBien);
    }
    if (criteria.ville) {
      query = query.eq('ville', criteria.ville);
    }
    if (criteria.quartier) {
      query = query.eq('quartier', criteria.quartier);
    }
    if (criteria.prixMin !== undefined) {
      query = query.gte('prix', criteria.prixMin);
    }
    if (criteria.prixMax !== undefined) {
      query = query.lte('prix', criteria.prixMax);
    }
    if (criteria.nombrePiecesMin !== undefined) {
      query = query.gte('nombre_pieces', criteria.nombrePiecesMin);
    }
    if (criteria.superficieMin !== undefined) {
      query = query.gte('superficie', criteria.superficieMin);
    }
    if (criteria.estMeuble !== undefined) {
      query = query.eq('est_meuble', criteria.estMeuble);
    }

    // Pagination
    const page = criteria.page || 1;
    const limit = criteria.limit || 20;
    const skip = (page - 1) * limit;

    query = query.range(skip, skip + limit - 1);

    // Tri - utiliser les noms de colonnes tels qu'ils sont dans la base de données
    // Le schéma Prisma n'a pas de @map pour dateCreation, donc la colonne est probablement en camelCase
    // Mais si la migration a été faite avec snake_case, utiliser snake_case
    const sortByMap: Record<string, string> = {
      dateCreation: 'dateCreation', // Essayer camelCase d'abord (nom Prisma)
      nombreVues: 'nombreVues', // Essayer camelCase d'abord
      prix: 'prix',
    };
    const sortBy = criteria.sortBy || 'dateCreation';
    const dbSortBy = sortByMap[sortBy] || sortBy;
    query = query.order(dbSortBy, {
      ascending: criteria.sortOrder === 'asc',
    });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Erreur lors de la recherche: ${error.message}`);
    }

    return {
      data: data ? data.map((item) => this.mapToEntity(item)) : [],
      total: count || 0,
    };
  }

  async incrementViews(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_annonce_views', { annonce_id: id });

    if (error) {
      // Fallback: récupérer, incrémenter, sauvegarder
      const annonce = await this.findById(id);
      if (annonce) {
        annonce.incrementViews();
        await this.update(annonce);
      }
    }
  }

  private mapToEntity(data: any): Annonce {
    const adresse = new Adresse(
      data.ville,
      data.quartier,
      data.adresse_complete || data.adresseComplete,
      data.latitude,
      data.longitude
    );

    return new Annonce(
      data.id,
      data.proprietaire_id || data.proprietaireId,
      data.titre,
      data.description,
      (data.type_bien || data.typeBien) as TypeBien,
      data.categorie_bien || data.categorieBien,
      new Prix(Number(data.prix)),
      new Prix(Number(data.caution)),
      adresse,
      data.superficie ? Number(data.superficie) : null,
      data.nombre_pieces || data.nombrePieces ? Number(data.nombre_pieces || data.nombrePieces) : null,
      data.est_meuble !== undefined ? data.est_meuble : data.estMeuble,
      data.equipements || [],
      data.photos || [],
      data.est_disponible !== undefined ? data.est_disponible : data.estDisponible,
      new Date(data.date_disponibilite || data.dateDisponibilite),
      new Date(data.date_creation || data.dateCreation),
      new Date(data.date_modification || data.dateModification),
      data.nombre_vues || data.nombreVues || 0,
      (data.statut_moderation || data.statutModeration) as StatutModeration
    );
  }

  private mapToDatabase(annonce: Annonce): any {
    return {
      id: annonce.id,
      proprietaireId: annonce.proprietaireId,
      titre: annonce.titre,
      description: annonce.description,
      typeBien: annonce.typeBien,
      categorieBien: annonce.categorieBien,
      prix: annonce.prix.getMontant(),
      caution: annonce.caution.getMontant(),
      ville: annonce.adresse.ville,
      quartier: annonce.adresse.quartier,
      adresseComplete: annonce.adresse.adresseComplete,
      latitude: annonce.adresse.latitude,
      longitude: annonce.adresse.longitude,
      superficie: annonce.superficie,
      nombrePieces: annonce.nombrePieces,
      estMeuble: annonce.estMeuble,
      equipements: annonce.equipements,
      photos: annonce.photos,
      estDisponible: annonce.estDisponible,
      dateDisponibilite: annonce.dateDisponibilite.toISOString(),
      dateCreation: annonce.dateCreation.toISOString(),
      dateModification: annonce.dateModification.toISOString(),
      nombreVues: annonce.nombreVues,
      statutModeration: annonce.statutModeration,
    };
  }
}
