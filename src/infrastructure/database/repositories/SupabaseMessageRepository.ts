import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { Message } from '@/core/domain/entities/Message.entity';
import { supabase } from '../supabase.client';

export class SupabaseMessageRepository implements IMessageRepository {
  async findById(id: string): Promise<Message | null> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return this.mapToEntity(data);
  }

  async findByReservation(reservationId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('reservationId', reservationId)
      .order('dateEnvoi', { ascending: true });

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async findByConversation(
    reservationId: string,
    userId1: string,
    userId2: string
  ): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('reservationId', reservationId)
      .or(`expediteurId.eq.${userId1},expediteurId.eq.${userId2}`)
      .or(`destinataireId.eq.${userId1},destinataireId.eq.${userId2}`)
      .order('dateEnvoi', { ascending: true });

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async findByUser(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .or(`expediteurId.eq.${userId},destinataireId.eq.${userId}`)
      .order('dateEnvoi', { ascending: false });

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async findUnreadByUser(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('destinataireId', userId)
      .eq('estLu', false)
      .order('dateEnvoi', { ascending: false });

    if (error || !data) return [];

    return data.map((item) => this.mapToEntity(item));
  }

  async countUnreadByUser(userId: string): Promise<number> {
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('destinataireId', userId)
      .eq('estLu', false);

    if (error) return 0;

    return count || 0;
  }

  async save(message: Message): Promise<void> {
    const { error } = await supabase.from('messages').insert([this.mapToDatabase(message)]);

    if (error) {
      throw new Error(`Erreur lors de la sauvegarde: ${error.message}`);
    }
  }

  async update(message: Message): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update(this.mapToDatabase(message))
      .eq('id', message.id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }

  async markAsRead(messageId: string, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({
        estLu: true,
        dateLecture: new Date().toISOString(),
      })
      .eq('id', messageId)
      .eq('destinataireId', userId);

    if (error) {
      throw new Error(`Erreur lors du marquage comme lu: ${error.message}`);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from('messages').delete().eq('id', id);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  private mapToEntity(data: any): Message {
    return new Message(
      data.id,
      data.reservationId || data.reservation_id,
      data.expediteurId || data.expediteur_id,
      data.destinataireId || data.destinataire_id,
      data.contenu,
      new Date(data.dateEnvoi || data.date_envoi),
      data.estLu !== undefined ? data.estLu : (data.est_lu !== undefined ? data.est_lu : false),
      data.dateLecture ? new Date(data.dateLecture || data.date_lecture) : null
    );
  }

  private mapToDatabase(message: Message): any {
    return {
      id: message.id,
      reservationId: message.reservationId,
      expediteurId: message.expediteurId,
      destinataireId: message.destinataireId,
      contenu: message.contenu,
      dateEnvoi: message.dateEnvoi.toISOString(),
      estLu: message.estLu,
      dateLecture: message.dateLecture ? message.dateLecture.toISOString() : null,
    };
  }
}
