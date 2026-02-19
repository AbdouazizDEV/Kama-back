import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { Reservation } from '@/core/domain/entities/Reservation.entity';
import { supabase } from '../supabase.client';
import { Prix } from '@/core/domain/value-objects/Prix.vo';
import { StatutReservation } from '@/shared/constants/statuses.constant';

export class SupabaseReservationRepository implements IReservationRepository {
  async findById(id: string): Promise<Reservation | null> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByLocataire(locataireId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('locataireId', locataireId);

    if (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }

    return data ? data.map((item) => this.mapToEntity(item)) : [];
  }

  async findByProprietaire(proprietaireId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('proprietaireId', proprietaireId);

    if (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }

    return data ? data.map((item) => this.mapToEntity(item)) : [];
  }

  async findByAnnonce(annonceId: string): Promise<Reservation[]> {
    const { data, error } = await supabase
      .from('reservations')
      .select('*')
      .eq('annonceId', annonceId);

    if (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }

    return data ? data.map((item) => this.mapToEntity(item)) : [];
  }

  async save(reservation: Reservation): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .insert([this.mapToDatabase(reservation)]);

    if (error) {
      throw new Error(`Erreur lors de la sauvegarde: ${error.message}`);
    }
  }

  async update(reservation: Reservation): Promise<void> {
    const { error } = await supabase
      .from('reservations')
      .update(this.mapToDatabase(reservation))
      .eq('id', reservation.id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('reservations').delete().eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  async findConflictingReservations(
    annonceId: string,
    dateDebut: Date,
    dateFin: Date,
    excludeReservationId?: string
  ): Promise<Reservation[]> {
    let query = supabase
      .from('reservations')
      .select('*')
      .eq('annonceId', annonceId)
      .in('statut', ['EN_ATTENTE', 'ACCEPTEE'])
      .or(
        `and(dateDebut.lte.${dateFin.toISOString()},dateFin.gte.${dateDebut.toISOString()})`
      );

    if (excludeReservationId) {
      query = query.neq('id', excludeReservationId);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la vérification: ${error.message}`);
    }

    return data ? data.map((item) => this.mapToEntity(item)) : [];
  }

  private mapToEntity(data: any): Reservation {
    return new Reservation(
      data.id,
      data.annonceId,
      data.locataireId,
      data.proprietaireId,
      new Date(data.dateDebut),
      new Date(data.dateFin),
      data.nombrePersonnes,
      new Prix(Number(data.prixTotal)),
      new Prix(Number(data.caution)),
      data.message,
      new Date(data.dateCreation),
      new Date(data.dateModification),
      data.statut as StatutReservation
    );
  }

  private mapToDatabase(reservation: Reservation): any {
    return {
      id: reservation.id,
      annonceId: reservation.annonceId,
      locataireId: reservation.locataireId,
      proprietaireId: reservation.proprietaireId,
      dateDebut: reservation.dateDebut.toISOString(),
      dateFin: reservation.dateFin.toISOString(),
      nombrePersonnes: reservation.nombrePersonnes,
      prixTotal: reservation.prixTotal.getMontant(),
      caution: reservation.caution.getMontant(),
      message: reservation.message,
      dateCreation: reservation.dateCreation.toISOString(),
      dateModification: reservation.dateModification.toISOString(),
      statut: reservation.statut,
    };
  }
}
