import { IColocationRepository } from '@/core/domain/repositories/IColocationRepository';
import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';

export interface SearchColocationsCriteria {
  ville?: string;
  nombrePlacesMin?: number;
  placesDisponibles?: boolean;
  page?: number;
  limit?: number;
}

export class SearchColocationsUseCase {
  constructor(
    private colocationRepository: IColocationRepository,
    private annonceRepository: IAnnonceRepository
  ) {}

  async execute(criteria: SearchColocationsCriteria) {
    const colocations = await this.colocationRepository.findByCriteres({
      ville: criteria.ville,
      nombrePlacesMin: criteria.nombrePlacesMin,
      placesDisponibles: criteria.placesDisponibles ?? true,
    });

    // Enrichir avec les détails des annonces
    const colocationsWithDetails = await Promise.all(
      colocations.map(async (colocation) => {
        const annonce = await this.annonceRepository.findById(colocation.annonceId);
        return {
          id: colocation.id,
          annonceId: colocation.annonceId,
          annonce: annonce
            ? {
                titre: annonce.titre,
                description: annonce.description,
                prix: annonce.prix.getMontant(),
                ville: annonce.adresse.ville,
                quartier: annonce.adresse.quartier,
                photos: annonce.photos,
              }
            : null,
          nombrePlaces: colocation.nombrePlaces,
          placesDisponibles: colocation.placesDisponibles,
          description: colocation.description,
          regles: colocation.regles,
          estActive: colocation.estActive,
          dateCreation: colocation.dateCreation,
        };
      })
    );

    const page = criteria.page || 1;
    const limit = criteria.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: colocationsWithDetails.slice(start, end),
      total: colocationsWithDetails.length,
      page,
      limit,
      totalPages: Math.ceil(colocationsWithDetails.length / limit),
    };
  }
}
