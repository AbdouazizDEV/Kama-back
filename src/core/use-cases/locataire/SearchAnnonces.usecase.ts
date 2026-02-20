import { IAnnonceRepository, SearchCriteria } from '@/core/domain/repositories/IAnnonceRepository';

export class SearchAnnoncesUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(criteria: SearchCriteria) {
    // Filtrer uniquement les annonces approuvées et disponibles
    const result = await this.annonceRepository.search({
      ...criteria,
      isPublic: true, // Utiliser le filtre public
    });

    return {
      data: result.data.map((annonce) => ({
        id: annonce.id,
        titre: annonce.titre,
        description: annonce.description,
        typeBien: annonce.typeBien,
        prix: annonce.prix.getMontant(),
        caution: annonce.caution.getMontant(),
        ville: annonce.adresse.ville,
        quartier: annonce.adresse.quartier,
        photos: annonce.photos,
        estDisponible: annonce.estDisponible,
        nombreVues: annonce.nombreVues,
        dateCreation: annonce.dateCreation,
      })),
      total: result.total,
      page: criteria.page || 1,
      limit: criteria.limit || 20,
      totalPages: Math.ceil(result.total / (criteria.limit || 20)),
    };
  }
}
