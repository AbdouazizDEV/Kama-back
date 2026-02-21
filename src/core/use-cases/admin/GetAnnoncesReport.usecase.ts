import { IAnnonceRepository, SearchCriteria } from '@/core/domain/repositories/IAnnonceRepository';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export interface AnnoncesReport {
  total: number;
  parStatut: {
    EN_ATTENTE: number;
    APPROUVE: number;
    REJETE: number;
  };
  parType: {
    APPARTEMENT: number;
    MAISON: number;
    TERRAIN: number;
    VEHICULE: number;
  };
  parVille: Array<{
    ville: string;
    count: number;
  }>;
  creesParMois: Array<{
    mois: string;
    count: number;
  }>;
  revenusPotentiels: number;
  moyennePrix: number;
}

export class GetAnnoncesReportUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(): Promise<AnnoncesReport> {
    const criteria: SearchCriteria = {
      page: 1,
      limit: 10000,
    };

    const { data: allAnnonces } = await this.annonceRepository.search(criteria);

    const total = allAnnonces.length;
    const enAttente = allAnnonces.filter((a) => a.statutModeration === StatutModeration.EN_ATTENTE).length;
    const approuvees = allAnnonces.filter((a) => a.statutModeration === StatutModeration.APPROUVE).length;
    const rejetees = allAnnonces.filter((a) => a.statutModeration === StatutModeration.REJETE).length;

    const appartements = allAnnonces.filter((a) => a.typeBien === 'APPARTEMENT').length;
    const maisons = allAnnonces.filter((a) => a.typeBien === 'MAISON').length;
    const terrains = allAnnonces.filter((a) => a.typeBien === 'TERRAIN').length;
    const vehicules = allAnnonces.filter((a) => a.typeBien === 'VEHICULE').length;

    const parVille = this.groupByVille(allAnnonces);
    const creesParMois = this.groupByMonth(allAnnonces);

    const prixTotal = allAnnonces.reduce((sum, a) => sum + a.prix.getMontant(), 0);
    const moyennePrix = total > 0 ? prixTotal / total : 0;

    // Revenus potentiels = somme des prix des annonces approuvées
    const revenusPotentiels = allAnnonces
      .filter((a) => a.statutModeration === StatutModeration.APPROUVE)
      .reduce((sum, a) => sum + a.prix.getMontant(), 0);

    return {
      total,
      parStatut: {
        EN_ATTENTE: enAttente,
        APPROUVE: approuvees,
        REJETE: rejetees,
      },
      parType: {
        APPARTEMENT: appartements,
        MAISON: maisons,
        TERRAIN: terrains,
        VEHICULE: vehicules,
      },
      parVille,
      creesParMois,
      revenusPotentiels,
      moyennePrix: Math.round(moyennePrix),
    };
  }

  private groupByVille(annonces: any[]): Array<{ ville: string; count: number }> {
    const grouped = new Map<string, number>();

    annonces.forEach((annonce) => {
      const ville = annonce.adresse.ville;
      grouped.set(ville, (grouped.get(ville) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([ville, count]) => ({ ville, count }))
      .sort((a, b) => b.count - a.count);
  }

  private groupByMonth(annonces: any[]): Array<{ mois: string; count: number }> {
    const grouped = new Map<string, number>();

    annonces.forEach((annonce) => {
      const date = new Date(annonce.dateCreation);
      const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      grouped.set(mois, (grouped.get(mois) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([mois, count]) => ({ mois, count }))
      .sort((a, b) => a.mois.localeCompare(b.mois));
  }
}
