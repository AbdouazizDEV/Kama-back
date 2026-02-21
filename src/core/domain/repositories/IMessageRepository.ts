import { Message } from '../entities/Message.entity';

export interface IMessageRepository {
  findById(id: string): Promise<Message | null>;
  findAll(): Promise<Message[]>;
  findByReservation(reservationId: string): Promise<Message[]>;
  findByConversation(
    reservationId: string,
    userId1: string,
    userId2: string
  ): Promise<Message[]>;
  findByUser(userId: string): Promise<Message[]>;
  findUnreadByUser(userId: string): Promise<Message[]>;
  findFlagged(): Promise<Message[]>;
  countUnreadByUser(userId: string): Promise<number>;
  save(message: Message): Promise<void>;
  update(message: Message): Promise<void>;
  markAsRead(messageId: string, userId: string): Promise<void>;
  delete(id: string): Promise<void>;
}
