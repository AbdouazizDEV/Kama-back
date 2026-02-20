import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { IFavoriRepository } from '@/core/domain/repositories/IFavoriRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';

export class GetRecommandationsUseCase {
  constructor(
    private annonceRepository: IAnnonceRepository,
    private favoriRepository: IFavoriRepository,
    private reservationRepository: IReservationRepository
  ) {}

  async execute(userId: string, limit: number = 10) {
    // Récupérer les favoris de l'utilisateur pour comprendre ses préférences
    const favoris = await this.favoriRepository.findByUser(userId);
    const reservations = await this.reservationRepository.findByLocataire(userId);

    // Analyser les préférences basées sur les favoris et réservations
    const villesPreferees: string[] = [];
    const typesBienPreferees: string[] = [];

    // Analyser les favoris
    for (const favori of favoris) {
      const annonce = await this.annonceRepository.findById(favori.annonceId);
      if (annonce) {
        villesPreferees.push(annonce.adresse.ville);
        typesBienPreferees.push(annonce.typeBien);
      }
    }

    // Analyser les réservations
    for (const reservation of reservations) {
      const annonce = await this.annonceRepository.findById(reservation.annonceId);
      if (annonce) {
        villesPreferees.push(annonce.adresse.ville);
        typesBienPreferees.push(annonce.typeBien);
      }
    }

    // Récupérer les villes et types les plus fréquents
    const villePreferee = this.getMostFrequent(villesPreferees);
    const typeBienPrefere = this.getMostFrequent(typesBienPreferees);

    // Rechercher des annonces similaires
    const criteria: any = {
      isPublic: true,
      limit,
      sortBy: 'nombreVues',
      sortOrder: 'desc' as const,
    };

    if (villePreferee) {
      criteria.ville = villePreferee;
    }
    if (typeBienPrefere) {
      criteria.typeBien = typeBienPrefere;
    }

    const result = await this.annonceRepository.search(criteria);

    return result.data.map((annonce) => ({
      id: annonce.id,
      titre: annonce.titre,
      description: annonce.description,
      typeBien: annonce.typeBien,
      prix: annonce.prix.getMontant(),
      ville: annonce.adresse.ville,
      quartier: annonce.adresse.quartier,
      photos: annonce.photos,
      nombreVues: annonce.nombreVues,
    }));
  }

  private getMostFrequent(items: string[]): string | null {
    if (items.length === 0) return null;

    const counts: Record<string, number> = {};
    items.forEach((item) => {
      counts[item] = (counts[item] || 0) + 1;
    });

    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  }
}
