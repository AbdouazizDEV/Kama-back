import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { StatutReservation } from '@/shared/constants/statuses.constant';
import { StatutPaiement } from '@/shared/constants/statuses.constant';

export class GetDashboardProprietaireUseCase {
  constructor(
    private userRepository: IUserRepository,
    private annonceRepository: IAnnonceRepository,
    private reservationRepository: IReservationRepository,
    private paiementRepository: IPaiementRepository
  ) {}

  async execute(proprietaireId: string) {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    // Récupérer les données
    const annonces = await this.annonceRepository.findByProprietaire(proprietaireId);
    const reservations = await this.reservationRepository.findByProprietaire(proprietaireId);
    const paiements = await this.paiementRepository.findByProprietaire(proprietaireId);

    // Statistiques rapides
    const annoncesActives = annonces.filter((a) => a.estDisponible && a.statutModeration === 'APPROUVE').length;
    const reservationsEnAttente = reservations.filter((r) => r.statut === StatutReservation.EN_ATTENTE).length;
    const revenusMois = this.calculerRevenusMois(paiements);
    const tauxOccupation = this.calculerTauxOccupation(annonces, reservations);

    // Dernières activités
    const dernieresReservations = reservations
      .sort((a, b) => b.dateCreation.getTime() - a.dateCreation.getTime())
      .slice(0, 5)
      .map((r) => ({
        id: r.id,
        dateDebut: r.dateDebut,
        dateFin: r.dateFin,
        statut: r.statut,
        prixTotal: r.prixTotal.getMontant(),
      }));

    return {
      statistiques: {
        annoncesTotal: annonces.length,
        annoncesActives,
        reservationsTotal: reservations.length,
        reservationsEnAttente,
        revenusMois,
        tauxOccupation,
      },
      dernieresReservations,
      alertes: {
        reservationsEnAttente: reservationsEnAttente > 0,
        paiementsEnAttente: paiements.filter((p) => p.statut === StatutPaiement.EN_ATTENTE).length > 0,
      },
    };
  }

  private calculerRevenusMois(paiements: any[]): number {
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    return paiements
      .filter(
        (p) =>
          p.statut === StatutPaiement.VALIDE &&
          p.dateValidation &&
          new Date(p.dateValidation) >= debutMois
      )
      .reduce((sum, p) => sum + p.montant.getMontant(), 0);
  }

  private calculerTauxOccupation(annonces: any[], reservations: any[]): number {
    // Calcul simplifié - à améliorer avec vraie logique de dates
    const reservationsActives = reservations.filter(
      (r) => r.statut === StatutReservation.ACCEPTEE || r.statut === StatutReservation.TERMINEE
    ).length;
    return annonces.length > 0 ? (reservationsActives / annonces.length) * 100 : 0;
  }
}
