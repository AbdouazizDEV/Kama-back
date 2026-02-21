import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { StatutReservation } from '@/shared/constants/statuses.constant';

export class GetDashboardOccupationProprietaireUseCase {
  constructor(
    private userRepository: IUserRepository,
    private annonceRepository: IAnnonceRepository,
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

    const annonces = await this.annonceRepository.findByProprietaire(proprietaireId);
    const reservations = await this.reservationRepository.findByProprietaire(proprietaireId);

    // Calculer le taux d'occupation par bien
    const tauxOccupationParBien = await Promise.all(
      annonces.map(async (annonce) => {
        const reservationsAnnonce = reservations.filter((r) => r.annonceId === annonce.id);
        const reservationsActives = reservationsAnnonce.filter(
          (r) => r.statut === StatutReservation.ACCEPTEE || r.statut === StatutReservation.TERMINEE
        );

        // Calculer les jours réservés
        const joursReserves = reservationsActives.reduce((sum, r) => {
          const jours = Math.ceil(
            (r.dateFin.getTime() - r.dateDebut.getTime()) / (1000 * 60 * 60 * 24)
          );
          return sum + jours;
        }, 0);

        // Calculer le taux (approximatif - sur les 30 derniers jours)
        const joursTotal = 30;
        const taux = joursTotal > 0 ? (joursReserves / joursTotal) * 100 : 0;

        return {
          annonceId: annonce.id,
          titre: annonce.titre,
          tauxOccupation: Math.min(taux, 100),
          joursReserves,
          nombreReservations: reservationsActives.length,
        };
      })
    );

    // Taux global
    const tauxGlobal =
      tauxOccupationParBien.length > 0
        ? tauxOccupationParBien.reduce((sum, item) => sum + item.tauxOccupation, 0) /
          tauxOccupationParBien.length
        : 0;

    return {
      tauxGlobal,
      parBien: tauxOccupationParBien,
    };
  }
}
