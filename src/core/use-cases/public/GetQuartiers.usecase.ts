import { supabase } from '@/infrastructure/database/supabase.client';

export interface Quartier {
  quartier: string;
  ville: string;
  count: number;
}

export interface GetQuartiersInput {
  ville?: string;
}

export class GetQuartiersUseCase {
  async execute(input: GetQuartiersInput): Promise<Quartier[]> {
    let query = supabase
      .from('annonces')
      .select('quartier, ville')
      .eq('statutModeration', 'APPROUVE')
      .eq('estDisponible', true);

    // Filtrer par ville si fournie
    if (input.ville) {
      query = query.eq('ville', input.ville);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Erreur lors de la récupération des quartiers: ${error.message}`);
    }

    // Compter les occurrences de chaque quartier
    const quartierCounts: Record<string, { ville: string; count: number }> = {};
    data?.forEach((item) => {
      const key = `${item.ville}-${item.quartier}`;
      if (!quartierCounts[key]) {
        quartierCounts[key] = { ville: item.ville, count: 0 };
      }
      quartierCounts[key].count++;
    });

    // Convertir en tableau et trier
    const quartiers: Quartier[] = Object.entries(quartierCounts)
      .map(([key, value]) => ({
        quartier: key.split('-')[1],
        ville: value.ville,
        count: value.count,
      }))
      .sort((a, b) => b.count - a.count);

    return quartiers;
  }
}
