import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class ListReservationsProprietaireUseCase {
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

    // Enrichir avec les détails des annonces et locataires
    const reservationsWithDetails = await Promise.all(
      reservations.map(async (reservation) => {
        const annonce = await this.annonceRepository.findById(reservation.annonceId);
        const locataire = await this.userRepository.findById(reservation.locataireId);

        return {
          id: reservation.id,
          annonceId: reservation.annonceId,
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
                id: locataire.id,
                nom: locataire.nom,
                prenom: locataire.prenom,
                email: locataire.email.getValue(),
                photoProfil: locataire.photoProfil,
              }
            : null,
          dateDebut: reservation.dateDebut,
          dateFin: reservation.dateFin,
          nombrePersonnes: reservation.nombrePersonnes,
          prixTotal: reservation.prixTotal.getMontant(),
          caution: reservation.caution.getMontant(),
          message: reservation.message,
          statut: reservation.statut,
          dateCreation: reservation.dateCreation,
          dateModification: reservation.dateModification,
        };
      })
    );

    return reservationsWithDetails;
  }
}
