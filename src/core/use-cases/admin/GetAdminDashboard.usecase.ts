import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAnnonceRepository, SearchCriteria } from '@/core/domain/repositories/IAnnonceRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { StatutModeration } from '@/shared/constants/statuses.constant';
import { StatutPaiement } from '@/shared/constants/statuses.constant';

export interface AdminDashboard {
  kpis: {
    utilisateursTotal: number;
    utilisateursActifs: number;
    annoncesTotal: number;
    annoncesEnAttente: number;
    reservationsTotal: number;
    reservationsEnAttente: number;
    paiementsTotal: number;
    revenusTotal: number;
  };
  alertes: {
    annoncesEnAttente: number;
    utilisateursNonVerifies: number;
    paiementsEnAttente: number;
    reservationsEnAttente: number;
  };
  activiteRecente: {
    nouveauxUtilisateurs: number; // dernière semaine
    nouvellesAnnonces: number; // dernière semaine
    nouvellesReservations: number; // dernière semaine
  };
}

export class GetAdminDashboardUseCase {
  constructor(
    private userRepository: IUserRepository,
    private annonceRepository: IAnnonceRepository,
    private reservationRepository: IReservationRepository,
    private paiementRepository: IPaiementRepository
  ) {}

  async execute(): Promise<AdminDashboard> {
    const allUsers = await this.userRepository.findAll();
    const { data: allAnnonces } = await this.annonceRepository.search({ page: 1, limit: 10000 });
    const allReservations = await this.reservationRepository.findAll();
    const allPaiements = await this.paiementRepository.findAll();

    const utilisateursTotal = allUsers.length;
    const utilisateursActifs = allUsers.filter((u) => u.estActif).length;

    const annoncesTotal = allAnnonces.length;
    const annoncesEnAttente = allAnnonces.filter((a) => a.statutModeration === StatutModeration.EN_ATTENTE).length;

    const reservationsTotal = allReservations.length;
    const reservationsEnAttente = allReservations.filter((r) => r.statut === 'EN_ATTENTE').length;

    const paiementsTotal = allPaiements.length;
    const paiementsValides = allPaiements.filter((p) => p.statut === StatutPaiement.VALIDE);
    const revenusTotal = paiementsValides.reduce((sum, p) => sum + p.montant.getMontant(), 0);

    const utilisateursNonVerifies = allUsers.filter((u) => !u.estVerifie).length;
    const paiementsEnAttente = allPaiements.filter((p) => p.statut === StatutPaiement.EN_ATTENTE).length;

    // Activité de la dernière semaine
    const uneSemaineAgo = new Date();
    uneSemaineAgo.setDate(uneSemaineAgo.getDate() - 7);

    const nouveauxUtilisateurs = allUsers.filter((u) => new Date(u.dateInscription) >= uneSemaineAgo).length;
    const nouvellesAnnonces = allAnnonces.filter((a) => new Date(a.dateCreation) >= uneSemaineAgo).length;
    const nouvellesReservations = allReservations.filter((r) => new Date(r.dateCreation) >= uneSemaineAgo).length;

    return {
      kpis: {
        utilisateursTotal,
        utilisateursActifs,
        annoncesTotal,
        annoncesEnAttente,
        reservationsTotal,
        reservationsEnAttente,
        paiementsTotal,
        revenusTotal,
      },
      alertes: {
        annoncesEnAttente,
        utilisateursNonVerifies,
        paiementsEnAttente,
        reservationsEnAttente,
      },
      activiteRecente: {
        nouveauxUtilisateurs,
        nouvellesAnnonces,
        nouvellesReservations,
      },
    };
  }
}
