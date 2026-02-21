import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class GetStatistiquesAnnonceProprietaireUseCase {
  constructor(
    private annonceRepository: IAnnonceRepository,
    private userRepository: IUserRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(annonceId: string, proprietaireId: string) {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const annonce = await this.annonceRepository.findById(annonceId);
    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    if (annonce.proprietaireId !== proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à consulter cette annonce');
    }

    // Récupérer les réservations pour cette annonce
    const reservations = await this.reservationRepository.findByAnnonce(annonceId);

    const totalReservations = reservations.length;
    const reservationsAcceptees = reservations.filter((r) => r.statut === 'ACCEPTEE').length;
    const reservationsTerminees = reservations.filter((r) => r.statut === 'TERMINEE').length;
    const reservationsEnAttente = reservations.filter((r) => r.statut === 'EN_ATTENTE').length;

    // Calculer le revenu total
    const revenuTotal = reservations
      .filter((r) => r.statut === 'ACCEPTEE' || r.statut === 'TERMINEE')
      .reduce((sum, r) => sum + r.prixTotal.getMontant(), 0);

    // Calculer le taux d'occupation (approximatif)
    const joursReserves = reservations
      .filter((r) => r.statut === 'ACCEPTEE' || r.statut === 'TERMINEE')
      .reduce((sum, r) => {
        const jours = Math.ceil(
          (r.dateFin.getTime() - r.dateDebut.getTime()) / (1000 * 60 * 60 * 24)
        );
        return sum + jours;
      }, 0);

    return {
      annonce: {
        id: annonce.id,
        titre: annonce.titre,
        nombreVues: annonce.nombreVues,
        estDisponible: annonce.estDisponible,
        statutModeration: annonce.statutModeration,
      },
      reservations: {
        total: totalReservations,
        acceptees: reservationsAcceptees,
        terminees: reservationsTerminees,
        enAttente: reservationsEnAttente,
        rejetees: reservations.filter((r) => r.statut === 'REJETEE').length,
      },
      revenus: {
        total: revenuTotal,
        moyenneParReservation:
          reservationsAcceptees > 0 ? revenuTotal / reservationsAcceptees : 0,
      },
      occupation: {
        joursReserves,
        tauxOccupation: 0, // À calculer selon la période
      },
    };
  }
}
