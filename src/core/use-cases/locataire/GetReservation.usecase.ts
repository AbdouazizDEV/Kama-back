import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class GetReservationUseCase {
  constructor(
    private reservationRepository: IReservationRepository,
    private annonceRepository: IAnnonceRepository
  ) {}

  async execute(reservationId: string, locataireId: string) {
    const reservation = await this.reservationRepository.findById(reservationId);

    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    // Vérifier que la réservation appartient au locataire
    if (reservation.locataireId !== locataireId) {
      throw ApiError.forbidden('Vous n\'avez pas accès à cette réservation');
    }

    const annonce = await this.annonceRepository.findById(reservation.annonceId);

    return {
      id: reservation.id,
      annonceId: reservation.annonceId,
      annonce: annonce
        ? {
            id: annonce.id,
            titre: annonce.titre,
            description: annonce.description,
            typeBien: annonce.typeBien,
            prix: annonce.prix.getMontant(),
            ville: annonce.adresse.ville,
            quartier: annonce.adresse.quartier,
            photos: annonce.photos,
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
