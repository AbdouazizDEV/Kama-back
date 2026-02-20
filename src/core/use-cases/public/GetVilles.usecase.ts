import { supabase } from '@/infrastructure/database/supabase.client';

export interface Ville {
  ville: string;
  count: number;
}

export class GetVillesUseCase {
  async execute(): Promise<Ville[]> {
    // Récupérer toutes les villes distinctes depuis les annonces approuvées
    const { data, error } = await supabase
      .from('annonces')
      .select('ville')
      .eq('statutModeration', 'APPROUVE')
      .eq('estDisponible', true);

    if (error) {
      throw new Error(`Erreur lors de la récupération des villes: ${error.message}`);
    }

    // Compter les occurrences de chaque ville
    const villeCounts: Record<string, number> = {};
    data?.forEach((item) => {
      const ville = item.ville;
      villeCounts[ville] = (villeCounts[ville] || 0) + 1;
    });

    // Convertir en tableau et trier par nombre d'annonces
    const villes: Ville[] = Object.entries(villeCounts)
      .map(([ville, count]) => ({ ville, count }))
      .sort((a, b) => b.count - a.count);

    return villes;
  }
}
