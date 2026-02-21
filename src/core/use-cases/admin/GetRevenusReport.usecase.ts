import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { StatutPaiement } from '@/shared/constants/statuses.constant';

export interface RevenusReport {
  totalTransactions: number;
  montantTotal: number;
  montantValide: number;
  montantRembourse: number;
  montantEnAttente: number;
  parMethode: {
    AIRTEL_MONEY: number;
    MOOV_MONEY: number;
    STRIPE: number;
    ESPECE: number;
  };
  revenusParMois: Array<{
    mois: string;
    montant: number;
    count: number;
  }>;
  evolution: Array<{
    mois: string;
    revenus: number;
    transactions: number;
  }>;
}

export class GetRevenusReportUseCase {
  constructor(private paiementRepository: IPaiementRepository) {}

  async execute(): Promise<RevenusReport> {
    const allPaiements = await this.paiementRepository.findAll();

    const totalTransactions = allPaiements.length;
    const montantTotal = allPaiements.reduce((sum, p) => sum + p.montant.getMontant(), 0);

    const paiementsValides = allPaiements.filter((p) => p.statut === StatutPaiement.VALIDE);
    const montantValide = paiementsValides.reduce((sum, p) => sum + p.montant.getMontant(), 0);

    const paiementsRembourses = allPaiements.filter((p) => p.statut === StatutPaiement.REMBOURSE);
    const montantRembourse = paiementsRembourses.reduce((sum, p) => sum + p.montant.getMontant(), 0);

    const paiementsEnAttente = allPaiements.filter((p) => p.statut === StatutPaiement.EN_ATTENTE);
    const montantEnAttente = paiementsEnAttente.reduce((sum, p) => sum + p.montant.getMontant(), 0);

    const airtelMoney = paiementsValides.filter((p) => p.methodePaiement === 'AIRTEL_MONEY').length;
    const moovMoney = paiementsValides.filter((p) => p.methodePaiement === 'MOOV_MONEY').length;
    const stripe = paiementsValides.filter((p) => p.methodePaiement === 'STRIPE').length;
    const espece = paiementsValides.filter((p) => p.methodePaiement === 'ESPECE').length;

    const revenusParMois = this.groupRevenusByMonth(paiementsValides);
    const evolution = this.groupEvolutionByMonth(paiementsValides);

    return {
      totalTransactions,
      montantTotal,
      montantValide,
      montantRembourse,
      montantEnAttente,
      parMethode: {
        AIRTEL_MONEY: airtelMoney,
        MOOV_MONEY: moovMoney,
        STRIPE: stripe,
        ESPECE: espece,
      },
      revenusParMois,
      evolution,
    };
  }

  private groupRevenusByMonth(paiements: any[]): Array<{ mois: string; montant: number; count: number }> {
    const grouped = new Map<string, { montant: number; count: number }>();

    paiements.forEach((paiement) => {
      const date = new Date(paiement.dateCreation);
      const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = grouped.get(mois) || { montant: 0, count: 0 };
      grouped.set(mois, {
        montant: existing.montant + paiement.montant.getMontant(),
        count: existing.count + 1,
      });
    });

    return Array.from(grouped.entries())
      .map(([mois, data]) => ({ mois, ...data }))
      .sort((a, b) => a.mois.localeCompare(b.mois));
  }

  private groupEvolutionByMonth(paiements: any[]): Array<{ mois: string; revenus: number; transactions: number }> {
    return this.groupRevenusByMonth(paiements).map((item) => ({
      mois: item.mois,
      revenus: item.montant,
      transactions: item.count,
    }));
  }
}
