import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class GetStatistiquesProfilProprietaireUseCase {
  constructor(
    private userRepository: IUserRepository,
    private annonceRepository: IAnnonceRepository,
    private reservationRepository: IReservationRepository,
    private paiementRepository: IPaiementRepository
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }
    if (user.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    // Récupérer toutes les annonces du propriétaire
    const annonces = await this.annonceRepository.findByProprietaire(userId);

    // Statistiques des annonces
    const totalAnnonces = annonces.length;
    const annoncesApprouvees = annonces.filter((a) => a.statutModeration === 'APPROUVE').length;
    const annoncesDisponibles = annonces.filter((a) => a.estDisponible).length;
    const totalVues = annonces.reduce((sum, a) => sum + a.nombreVues, 0);

    // Récupérer toutes les réservations
    const reservations = await this.reservationRepository.findByProprietaire(userId);
    const totalReservations = reservations.length;
    const reservationsAcceptees = reservations.filter((r) => r.statut === 'ACCEPTEE').length;
    const reservationsTerminees = reservations.filter((r) => r.statut === 'TERMINEE').length;

    // Récupérer tous les paiements
    const paiements = await this.paiementRepository.findByProprietaire(userId);
    const totalPaiements = paiements.length;
    const paiementsValides = paiements.filter((p) => p.statut === 'VALIDE').length;
    const revenusTotal = paiements
      .filter((p) => p.statut === 'VALIDE')
      .reduce((sum, p) => sum + p.montant.getMontant(), 0);

    return {
      annonces: {
        total: totalAnnonces,
        approuvees: annoncesApprouvees,
        disponibles: annoncesDisponibles,
        enAttente: totalAnnonces - annoncesApprouvees,
        totalVues,
      },
      reservations: {
        total: totalReservations,
        acceptees: reservationsAcceptees,
        terminees: reservationsTerminees,
        enAttente: reservations.filter((r) => r.statut === 'EN_ATTENTE').length,
      },
      paiements: {
        total: totalPaiements,
        valides: paiementsValides,
        revenusTotal,
      },
    };
  }
}
