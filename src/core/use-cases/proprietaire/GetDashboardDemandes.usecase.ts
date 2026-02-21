import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { StatutReservation } from '@/shared/constants/statuses.constant';

export class GetDashboardDemandesProprietaireUseCase {
  constructor(
    private userRepository: IUserRepository,
    private reservationRepository: IReservationRepository,
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

    // Filtrer les demandes récentes (7 derniers jours)
    const dateLimite = new Date();
    dateLimite.setDate(dateLimite.getDate() - 7);

    const demandesRecent = reservations
      .filter((r) => r.dateCreation >= dateLimite)
      .sort((a, b) => b.dateCreation.getTime() - a.dateCreation.getTime())
      .slice(0, 10);

    // Enrichir avec les détails
    const demandesAvecDetails = await Promise.all(
      demandesRecent.map(async (reservation) => {
        const annonce = await this.annonceRepository.findById(reservation.annonceId);

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
          dateDebut: reservation.dateDebut,
          dateFin: reservation.dateFin,
          prixTotal: reservation.prixTotal.getMontant(),
          statut: reservation.statut,
          dateCreation: reservation.dateCreation,
          priorite: this.calculerPriorite(reservation),
        };
      })
    );

    return {
      total: demandesRecent.length,
      enAttente: demandesRecent.filter((r) => r.statut === StatutReservation.EN_ATTENTE).length,
      demandes: demandesAvecDetails,
    };
  }

  private calculerPriorite(reservation: any): 'haute' | 'moyenne' | 'basse' {
    const joursAvantDebut = Math.ceil(
      (reservation.dateDebut.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    if (joursAvantDebut < 7) return 'haute';
    if (joursAvantDebut < 30) return 'moyenne';
    return 'basse';
  }
}
