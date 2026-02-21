import { IAnnonceRepository, SearchCriteria } from '@/core/domain/repositories/IAnnonceRepository';

export class SearchAnnoncesEtudiantsUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(criteria: SearchCriteria) {
    // Rechercher uniquement les annonces marquées pour étudiants
    // On peut utiliser un équipement spécial "Logement étudiant" ou un tag
    const result = await this.annonceRepository.search({
      ...criteria,
      isPublic: true,
      equipements: criteria.equipements 
        ? [...criteria.equipements, 'Logement étudiant']
        : ['Logement étudiant'],
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
