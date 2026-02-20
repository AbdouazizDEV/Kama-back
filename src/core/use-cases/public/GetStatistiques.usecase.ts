import { supabase } from '@/infrastructure/database/supabase.client';

export interface Statistiques {
  totalAnnonces: number;
  totalAnnoncesDisponibles: number;
  totalUtilisateurs: number;
  totalReservations: number;
  annoncesParType: {
    APPARTEMENT: number;
    MAISON: number;
    TERRAIN: number;
    VEHICULE: number;
  };
  annoncesParVille: Array<{
    ville: string;
    count: number;
  }>;
}

export class GetStatistiquesUseCase {
  async execute(): Promise<Statistiques> {
    // Total annonces approuvées (utiliser camelCase car pas de @map dans Prisma)
    const { count: totalAnnonces } = await supabase
      .from('annonces')
      .select('*', { count: 'exact', head: true })
      .eq('statutModeration', 'APPROUVE');

    // Total annonces disponibles
    const { count: totalAnnoncesDisponibles } = await supabase
      .from('annonces')
      .select('*', { count: 'exact', head: true })
      .eq('statutModeration', 'APPROUVE')
      .eq('estDisponible', true);

    // Total utilisateurs actifs
    const { count: totalUtilisateurs } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('est_actif', true);

    // Total réservations
    const { count: totalReservations } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true });

    // Annonces par type
    const { data: annoncesParType } = await supabase
      .from('annonces')
      .select('typeBien')
      .eq('statutModeration', 'APPROUVE');

    const typeCounts = {
      APPARTEMENT: 0,
      MAISON: 0,
      TERRAIN: 0,
      VEHICULE: 0,
    };

    annoncesParType?.forEach((item) => {
      const type = item.typeBien as keyof typeof typeCounts;
      if (typeCounts[type] !== undefined) {
        typeCounts[type]++;
      }
    });

    // Annonces par ville (top 5)
    const { data: annoncesParVille } = await supabase
      .from('annonces')
      .select('ville')
      .eq('statutModeration', 'APPROUVE');

    const villeCounts: Record<string, number> = {};
    annoncesParVille?.forEach((item) => {
      villeCounts[item.ville] = (villeCounts[item.ville] || 0) + 1;
    });

    const topVilles = Object.entries(villeCounts)
      .map(([ville, count]) => ({ ville, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalAnnonces: totalAnnonces || 0,
      totalAnnoncesDisponibles: totalAnnoncesDisponibles || 0,
      totalUtilisateurs: totalUtilisateurs || 0,
      totalReservations: totalReservations || 0,
      annoncesParType: typeCounts,
      annoncesParVille: topVilles,
    };
  }
}
