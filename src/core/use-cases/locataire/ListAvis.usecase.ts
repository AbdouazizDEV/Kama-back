import { IAvisRepository } from '@/core/domain/repositories/IAvisRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';

export class ListAvisUseCase {
  constructor(
    private avisRepository: IAvisRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(locataireId: string) {
    const avis = await this.avisRepository.findByLocataire(locataireId);

    // Enrichir avec les détails des réservations
    const avisWithDetails = await Promise.all(
      avis.map(async (a) => {
        const reservation = await this.reservationRepository.findById(a.reservationId);
        return {
          id: a.id,
          reservationId: a.reservationId,
          note: a.note,
          commentaire: a.commentaire,
          dateCreation: a.dateCreation,
          dateModification: a.dateModification,
          reservation: reservation
            ? {
                dateDebut: reservation.dateDebut,
                dateFin: reservation.dateFin,
                statut: reservation.statut,
              }
            : null,
        };
      })
    );

    return avisWithDetails;
  }
}
