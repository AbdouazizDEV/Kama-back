import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { StatutReservation } from '@/shared/constants/statuses.constant';

export class ListReservationsEnAttenteProprietaireUseCase {
  constructor(
    private reservationRepository: IReservationRepository,
    private userRepository: IUserRepository,
    private annonceRepository: IAnnonceRepository
  ) {}

  async execute(proprietaireId: string) {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const reservations = await this.reservationRepository.findByProprietaire(proprietaireId);
    const reservationsEnAttente = reservations.filter(
      (r) => r.statut === StatutReservation.EN_ATTENTE
    );

    // Enrichir avec les détails
    const reservationsWithDetails = await Promise.all(
      reservationsEnAttente.map(async (reservation) => {
        const annonce = await this.annonceRepository.findById(reservation.annonceId);
        const locataire = await this.userRepository.findById(reservation.locataireId);

        return {
          id: reservation.id,
          annonce: annonce
            ? {
                titre: annonce.titre,
                typeBien: annonce.typeBien,
                ville: annonce.adresse.ville,
                photos: annonce.photos,
              }
            : null,
          locataire: locataire
            ? {
                nom: locataire.nom,
                prenom: locataire.prenom,
                photoProfil: locataire.photoProfil,
              }
            : null,
          dateDebut: reservation.dateDebut,
          dateFin: reservation.dateFin,
          prixTotal: reservation.prixTotal.getMontant(),
          message: reservation.message,
          dateCreation: reservation.dateCreation,
        };
      })
    );

    return reservationsWithDetails;
  }
}
