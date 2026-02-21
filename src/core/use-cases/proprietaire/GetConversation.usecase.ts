import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class GetConversationProprietaireUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private userRepository: IUserRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(reservationId: string, proprietaireId: string) {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    if (reservation.proprietaireId !== proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à consulter cette conversation');
    }

    const messages = await this.messageRepository.findByReservation(reservationId);
    const locataire = await this.userRepository.findById(reservation.locataireId);

    return {
      reservation: {
        id: reservation.id,
        annonceId: reservation.annonceId,
        dateDebut: reservation.dateDebut,
        dateFin: reservation.dateFin,
        statut: reservation.statut,
      },
      locataire: locataire
        ? {
            id: locataire.id,
            nom: locataire.nom,
            prenom: locataire.prenom,
            photoProfil: locataire.photoProfil,
          }
        : null,
      messages: messages.map((message) => ({
        id: message.id,
        expediteurId: message.expediteurId,
        destinataireId: message.destinataireId,
        contenu: message.contenu,
        dateEnvoi: message.dateEnvoi,
        estLu: message.estLu,
        dateLecture: message.dateLecture,
      })),
    };
  }
}
