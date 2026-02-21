import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { Paiement, MethodePaiement } from '@/core/domain/entities/Paiement.entity';
import { supabase } from '../supabase.client';
import { Prix } from '@/core/domain/value-objects/Prix.vo';
import { StatutPaiement } from '@/shared/constants/statuses.constant';

export class SupabasePaiementRepository implements IPaiementRepository {
  async findById(id: string): Promise<Paiement | null> {
    const { data, error } = await supabase
      .from('paiements')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByReservation(reservationId: string): Promise<Paiement[]> {
    const { data, error } = await supabase
      .from('paiements')
      .select('*')
      .eq('reservationId', reservationId);

    if (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }

    return data ? data.map((item) => this.mapToEntity(item)) : [];
  }

  async findByLocataire(locataireId: string): Promise<Paiement[]> {
    const { data, error } = await supabase
      .from('paiements')
      .select('*')
      .eq('locataireId', locataireId);

    if (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }

    return data ? data.map((item) => this.mapToEntity(item)) : [];
  }

  async findByProprietaire(proprietaireId: string): Promise<Paiement[]> {
    const { data, error } = await supabase
      .from('paiements')
      .select('*')
      .eq('proprietaireId', proprietaireId);

    if (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }

    return data ? data.map((item) => this.mapToEntity(item)) : [];
  }

  async findAll(): Promise<Paiement[]> {
    const { data, error } = await supabase
      .from('paiements')
      .select('*')
      .order('dateCreation', { ascending: false });

    if (error) {
      throw new Error(`Erreur lors de la récupération: ${error.message}`);
    }

    return data ? data.map((item) => this.mapToEntity(item)) : [];
  }

  async save(paiement: Paiement): Promise<void> {
    const { error } = await supabase
      .from('paiements')
      .insert([this.mapToDatabase(paiement)]);

    if (error) {
      throw new Error(`Erreur lors de la sauvegarde: ${error.message}`);
    }
  }

  async update(paiement: Paiement): Promise<void> {
    const { error } = await supabase
      .from('paiements')
      .update(this.mapToDatabase(paiement))
      .eq('id', paiement.id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('paiements').delete().eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  private mapToEntity(data: any): Paiement {
    return new Paiement(
      data.id,
      data.reservationId,
      data.locataireId,
      data.proprietaireId,
      new Prix(Number(data.montant)),
      data.methodePaiement as MethodePaiement,
      new Date(data.dateCreation),
      new Date(data.dateModification),
      data.statut as StatutPaiement,
      data.referenceTransaction,
      data.dateValidation ? new Date(data.dateValidation) : null,
      data.motifEchec
    );
  }

  private mapToDatabase(paiement: Paiement): any {
    return {
      id: paiement.id,
      reservationId: paiement.reservationId,
      locataireId: paiement.locataireId,
      proprietaireId: paiement.proprietaireId,
      montant: paiement.montant.getMontant(),
      methodePaiement: paiement.methodePaiement,
      dateCreation: paiement.dateCreation.toISOString(),
      dateModification: paiement.dateModification.toISOString(),
      statut: paiement.statut,
      referenceTransaction: paiement.referenceTransaction,
      dateValidation: paiement.dateValidation?.toISOString(),
      motifEchec: paiement.motifEchec,
    };
  }
}
