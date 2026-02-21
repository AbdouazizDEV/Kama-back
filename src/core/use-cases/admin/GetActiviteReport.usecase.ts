import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAnnonceRepository, SearchCriteria } from '@/core/domain/repositories/IAnnonceRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';

export interface ActiviteReport {
  periode: {
    dateDebut: Date;
    dateFin: Date;
  };
  utilisateurs: {
    nouveaux: number;
    actifs: number;
    verifies: number;
  };
  annonces: {
    creees: number;
    approuvees: number;
    rejetees: number;
  };
  reservations: {
    creees: number;
    acceptees: number;
    terminees: number;
  };
  paiements: {
    total: number;
    valides: number;
    montantTotal: number;
  };
  activiteParJour: Array<{
    jour: string;
    utilisateurs: number;
    annonces: number;
    reservations: number;
    paiements: number;
  }>;
}

export class GetActiviteReportUseCase {
  constructor(
    private userRepository: IUserRepository,
    private annonceRepository: IAnnonceRepository,
    private reservationRepository: IReservationRepository,
    private paiementRepository: IPaiementRepository
  ) {}

  async execute(dateDebut?: Date, dateFin?: Date): Promise<ActiviteReport> {
    const fin = dateFin || new Date();
    const debut = dateDebut || new Date(fin.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 jours par défaut

    const allUsers = await this.userRepository.findAll();
    const { data: allAnnonces } = await this.annonceRepository.search({ page: 1, limit: 10000 });
    const allReservations = await this.reservationRepository.findAll();
    const allPaiements = await this.paiementRepository.findAll();

    // Filtrer par période
    const usersPeriode = allUsers.filter((u) => {
      const date = new Date(u.dateInscription);
      return date >= debut && date <= fin;
    });

    const annoncesPeriode = allAnnonces.filter((a) => {
      const date = new Date(a.dateCreation);
      return date >= debut && date <= fin;
    });

    const reservationsPeriode = allReservations.filter((r) => {
      const date = new Date(r.dateCreation);
      return date >= debut && date <= fin;
    });

    const paiementsPeriode = allPaiements.filter((p) => {
      const date = new Date(p.dateCreation);
      return date >= debut && date <= fin;
    });

    const nouveauxUsers = usersPeriode.length;
    const actifsUsers = usersPeriode.filter((u) => u.estActif).length;
    const verifiesUsers = usersPeriode.filter((u) => u.estVerifie).length;

    const annoncesCreees = annoncesPeriode.length;
    const annoncesApprouvees = annoncesPeriode.filter((a) => a.statutModeration === 'APPROUVE').length;
    const annoncesRejetees = annoncesPeriode.filter((a) => a.statutModeration === 'REJETE').length;

    const reservationsCreees = reservationsPeriode.length;
    const reservationsAcceptees = reservationsPeriode.filter((r) => r.statut === 'ACCEPTEE').length;
    const reservationsTerminees = reservationsPeriode.filter((r) => r.statut === 'TERMINEE').length;

    const paiementsTotal = paiementsPeriode.length;
    const paiementsValides = paiementsPeriode.filter((p) => p.statut === 'VALIDE');
    const montantTotal = paiementsValides.reduce((sum, p) => sum + p.montant.getMontant(), 0);

    const activiteParJour = this.groupByDay(debut, fin, {
      users: usersPeriode,
      annonces: annoncesPeriode,
      reservations: reservationsPeriode,
      paiements: paiementsPeriode,
    });

    return {
      periode: {
        dateDebut: debut,
        dateFin: fin,
      },
      utilisateurs: {
        nouveaux: nouveauxUsers,
        actifs: actifsUsers,
        verifies: verifiesUsers,
      },
      annonces: {
        creees: annoncesCreees,
        approuvees: annoncesApprouvees,
        rejetees: annoncesRejetees,
      },
      reservations: {
        creees: reservationsCreees,
        acceptees: reservationsAcceptees,
        terminees: reservationsTerminees,
      },
      paiements: {
        total: paiementsTotal,
        valides: paiementsValides,
        montantTotal,
      },
      activiteParJour,
    };
  }

  private groupByDay(
    debut: Date,
    fin: Date,
    data: {
      users: any[];
      annonces: any[];
      reservations: any[];
      paiements: any[];
    }
  ): Array<{ jour: string; utilisateurs: number; annonces: number; reservations: number; paiements: number }> {
    const grouped = new Map<string, { utilisateurs: number; annonces: number; reservations: number; paiements: number }>();

    const currentDate = new Date(debut);
    while (currentDate <= fin) {
      const jour = currentDate.toISOString().split('T')[0];
      grouped.set(jour, { utilisateurs: 0, annonces: 0, reservations: 0, paiements: 0 });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    data.users.forEach((user) => {
      const jour = new Date(user.dateInscription).toISOString().split('T')[0];
      const existing = grouped.get(jour);
      if (existing) existing.utilisateurs++;
    });

    data.annonces.forEach((annonce) => {
      const jour = new Date(annonce.dateCreation).toISOString().split('T')[0];
      const existing = grouped.get(jour);
      if (existing) existing.annonces++;
    });

    data.reservations.forEach((reservation) => {
      const jour = new Date(reservation.dateCreation).toISOString().split('T')[0];
      const existing = grouped.get(jour);
      if (existing) existing.reservations++;
    });

    data.paiements.forEach((paiement) => {
      const jour = new Date(paiement.dateCreation).toISOString().split('T')[0];
      const existing = grouped.get(jour);
      if (existing) existing.paiements++;
    });

    return Array.from(grouped.entries())
      .map(([jour, data]) => ({ jour, ...data }))
      .sort((a, b) => a.jour.localeCompare(b.jour));
  }
}
