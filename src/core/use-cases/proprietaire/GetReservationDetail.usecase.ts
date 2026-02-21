import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class GetReservationDetailProprietaireUseCase {
  constructor(
    private reservationRepository: IReservationRepository,
    private userRepository: IUserRepository,
    private annonceRepository: IAnnonceRepository
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
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à consulter cette réservation');
    }

    const annonce = await this.annonceRepository.findById(reservation.annonceId);
    const locataire = await this.userRepository.findById(reservation.locataireId);

    return {
      id: reservation.id,
      annonce: annonce
        ? {
            id: annonce.id,
            titre: annonce.titre,
            description: annonce.description,
            typeBien: annonce.typeBien,
            ville: annonce.adresse.ville,
            quartier: annonce.adresse.quartier,
            photos: annonce.photos,
          }
        : null,
      locataire: locataire
        ? {
            id: locataire.id,
            nom: locataire.nom,
            prenom: locataire.prenom,
            email: locataire.email.getValue(),
            telephone: locataire.telephone,
            photoProfil: locataire.photoProfil,
            estVerifie: locataire.estVerifie,
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
  }
}
