import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';

export class ListReservationsUseCase {
  constructor(
    private reservationRepository: IReservationRepository,
    private annonceRepository: IAnnonceRepository
  ) {}

  async execute(locataireId: string) {
    const reservations = await this.reservationRepository.findByLocataire(locataireId);

    // Enrichir avec les détails des annonces
    const reservationsWithDetails = await Promise.all(
      reservations.map(async (reservation) => {
        const annonce = await this.annonceRepository.findById(reservation.annonceId);
        return {
          id: reservation.id,
          annonceId: reservation.annonceId,
          annonce: annonce
            ? {
                titre: annonce.titre,
                typeBien: annonce.typeBien,
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
      })
    );

    return reservationsWithDetails;
  }
}
