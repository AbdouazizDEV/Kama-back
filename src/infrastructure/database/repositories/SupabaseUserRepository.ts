import { IUserRepository, UserFilters } from '@/core/domain/repositories/IUserRepository';
import { User } from '@/core/domain/entities/User.entity';
import { supabase } from '../supabase.client';
import { Email } from '@/core/domain/value-objects/Email.vo';
import { Password } from '@/core/domain/value-objects/Password.vo';

export class SupabaseUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async save(user: User): Promise<void> {
    const { error } = await supabase.from('users').insert([this.mapToDatabase(user)]);

    if (error) {
      throw new Error(`Erreur lors de la sauvegarde: ${error.message}`);
    }
  }

  async update(user: User): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update(this.mapToDatabase(user))
      .eq('id', user.id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  async findAll(filters?: UserFilters): Promise<User[]> {
    let query = supabase.from('users').select('*');

    if (filters?.typeUtilisateur) {
      query = query.eq('type_utilisateur', filters.typeUtilisateur);
    }
    if (filters?.estActif !== undefined) {
      query = query.eq('est_actif', filters.estActif);
    }
    if (filters?.estVerifie !== undefined) {
      query = query.eq('est_verifie', filters.estVerifie);
    }
    if (filters?.search) {
      query = query.or(
        `nom.ilike.%${filters.search}%,prenom.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }

    return data ? data.map((item) => this.mapToEntity(item)) : [];
  }

  async count(filters?: UserFilters): Promise<number> {
    let query = supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (filters?.typeUtilisateur) {
      query = query.eq('type_utilisateur', filters.typeUtilisateur);
    }
    if (filters?.estActif !== undefined) {
      query = query.eq('est_actif', filters.estActif);
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(`Erreur lors du comptage: ${error.message}`);
    }

    return count || 0;
  }

  private mapToEntity(data: any): User {
    return new User(
      data.id,
      new Email(data.email),
      Password.fromHash(data.password),
      data.nom,
      data.prenom,
      data.telephone,
      data.photo_profil,
      new Date(data.date_inscription),
      data.est_actif,
      data.est_verifie,
      data.type_utilisateur
    );
  }

  private mapToDatabase(user: User): any {
    return {
      id: user.id,
      email: user.email.getValue(),
      password: user.getPasswordHash(),
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone,
      photo_profil: user.photoProfil,
      date_inscription: user.dateInscription.toISOString(),
      est_actif: user.estActif,
      est_verifie: user.estVerifie,
      type_utilisateur: user.typeUtilisateur,
    };
  }
}
