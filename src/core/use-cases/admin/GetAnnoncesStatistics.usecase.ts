import { IAnnonceRepository, SearchCriteria } from '@/core/domain/repositories/IAnnonceRepository';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export interface AnnoncesStatistics {
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
  disponibles: number;
  nonDisponibles: number;
  avecPhotos: number;
  sansPhotos: number;
  moyenneVues: number;
  totalVues: number;
  creesParMois: Array<{
    mois: string;
    count: number;
  }>;
}

export class GetAnnoncesStatisticsUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(): Promise<AnnoncesStatistics> {
    const criteria: SearchCriteria = {
      page: 1,
      limit: 10000, // Récupérer toutes les annonces pour les statistiques
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

    const disponibles = allAnnonces.filter((a) => a.estDisponible).length;
    const nonDisponibles = total - disponibles;

    const avecPhotos = allAnnonces.filter((a) => a.photos.length > 0).length;
    const sansPhotos = total - avecPhotos;

    const totalVues = allAnnonces.reduce((sum, a) => sum + a.nombreVues, 0);
    const moyenneVues = total > 0 ? Math.round(totalVues / total) : 0;

    const creesParMois = this.groupByMonth(allAnnonces);

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
      disponibles,
      nonDisponibles,
      avecPhotos,
      sansPhotos,
      moyenneVues,
      totalVues,
      creesParMois,
    };
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
