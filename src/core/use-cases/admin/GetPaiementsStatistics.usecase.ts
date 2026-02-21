import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { StatutPaiement } from '@/shared/constants/statuses.constant';

export interface PaiementsStatistics {
  total: number;
  parStatut: {
    EN_ATTENTE: number;
    VALIDE: number;
    ECHOUE: number;
    REMBOURSE: number;
  };
  montantTotal: number;
  montantMoyen: number;
  montantTotalValide: number;
  montantTotalRembourse: number;
  parMethode: {
    AIRTEL_MONEY: number;
    MOOV_MONEY: number;
    STRIPE: number;
    ESPECE: number;
  };
  creesParMois: Array<{
    mois: string;
    count: number;
    montant: number;
  }>;
}

export class GetPaiementsStatisticsUseCase {
  constructor(private paiementRepository: IPaiementRepository) {}

  async execute(): Promise<PaiementsStatistics> {
    const allPaiements = await this.paiementRepository.findAll();

    const total = allPaiements.length;
    const enAttente = allPaiements.filter((p) => p.statut === StatutPaiement.EN_ATTENTE).length;
    const valides = allPaiements.filter((p) => p.statut === StatutPaiement.VALIDE).length;
    const echoues = allPaiements.filter((p) => p.statut === StatutPaiement.ECHOUE).length;
    const rembourses = allPaiements.filter((p) => p.statut === StatutPaiement.REMBOURSE).length;

    const montantTotal = allPaiements.reduce((sum, p) => sum + p.montant.getMontant(), 0);
    const montantMoyen = total > 0 ? montantTotal / total : 0;

    const paiementsValides = allPaiements.filter((p) => p.statut === StatutPaiement.VALIDE);
    const montantTotalValide = paiementsValides.reduce((sum, p) => sum + p.montant.getMontant(), 0);

    const paiementsRembourses = allPaiements.filter((p) => p.statut === StatutPaiement.REMBOURSE);
    const montantTotalRembourse = paiementsRembourses.reduce((sum, p) => sum + p.montant.getMontant(), 0);

    const airtelMoney = allPaiements.filter((p) => p.methodePaiement === 'AIRTEL_MONEY').length;
    const moovMoney = allPaiements.filter((p) => p.methodePaiement === 'MOOV_MONEY').length;
    const stripe = allPaiements.filter((p) => p.methodePaiement === 'STRIPE').length;
    const espece = allPaiements.filter((p) => p.methodePaiement === 'ESPECE').length;

    const creesParMois = this.groupByMonth(allPaiements);

    return {
      total,
      parStatut: {
        EN_ATTENTE: enAttente,
        VALIDE: valides,
        ECHOUE: echoues,
        REMBOURSE: rembourses,
      },
      montantTotal,
      montantMoyen: Math.round(montantMoyen),
      montantTotalValide,
      montantTotalRembourse,
      parMethode: {
        AIRTEL_MONEY: airtelMoney,
        MOOV_MONEY: moovMoney,
        STRIPE: stripe,
        ESPECE: espece,
      },
      creesParMois,
    };
  }

  private groupByMonth(paiements: any[]): Array<{ mois: string; count: number; montant: number }> {
    const grouped = new Map<string, { count: number; montant: number }>();

    paiements.forEach((paiement) => {
      const date = new Date(paiement.dateCreation);
      const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = grouped.get(mois) || { count: 0, montant: 0 };
      grouped.set(mois, {
        count: existing.count + 1,
        montant: existing.montant + paiement.montant.getMontant(),
      });
    });

    return Array.from(grouped.entries())
      .map(([mois, data]) => ({ mois, ...data }))
      .sort((a, b) => a.mois.localeCompare(b.mois));
  }
}
