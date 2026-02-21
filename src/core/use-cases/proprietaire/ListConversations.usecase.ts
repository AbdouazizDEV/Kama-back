import { IMessageRepository } from '@/core/domain/repositories/IMessageRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class ListConversationsProprietaireUseCase {
  constructor(
    private messageRepository: IMessageRepository,
    private userRepository: IUserRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(proprietaireId: string) {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    // Récupérer toutes les réservations du propriétaire
    const reservations = await this.reservationRepository.findByProprietaire(proprietaireId);

    // Pour chaque réservation, récupérer les messages et créer une conversation
    const conversations = await Promise.all(
      reservations.map(async (reservation) => {
        const messages = await this.messageRepository.findByReservation(reservation.id);
        const locataire = await this.userRepository.findById(reservation.locataireId);

        // Compter les messages non lus
        const messagesNonLus = messages.filter(
          (m) => !m.estLu && m.expediteurId !== proprietaireId
        ).length;

        // Dernier message
        const dernierMessage = messages.length > 0 ? messages[messages.length - 1] : null;

        return {
          reservationId: reservation.id,
          annonceId: reservation.annonceId,
          locataire: locataire
            ? {
                id: locataire.id,
                nom: locataire.nom,
                prenom: locataire.prenom,
                photoProfil: locataire.photoProfil,
              }
            : null,
          dernierMessage: dernierMessage
            ? {
                contenu: dernierMessage.contenu,
                dateEnvoi: dernierMessage.dateEnvoi,
                estLu: dernierMessage.estLu,
              }
            : null,
          messagesNonLus,
          dateCreation: reservation.dateCreation,
        };
      })
    );

    // Trier par date du dernier message (plus récent en premier)
    return conversations.sort((a, b) => {
      if (!a.dernierMessage && !b.dernierMessage) return 0;
      if (!a.dernierMessage) return 1;
      if (!b.dernierMessage) return -1;
      return (
        new Date(b.dernierMessage!.dateEnvoi).getTime() -
        new Date(a.dernierMessage!.dateEnvoi).getTime()
      );
    });
  }
}
