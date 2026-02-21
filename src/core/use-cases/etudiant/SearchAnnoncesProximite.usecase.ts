import { IAnnonceRepository, SearchCriteria } from '@/core/domain/repositories/IAnnonceRepository';
import { IEtudiantRepository } from '@/core/domain/repositories/IEtudiantRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class SearchAnnoncesProximiteUseCase {
  constructor(
    private annonceRepository: IAnnonceRepository,
    private etudiantRepository: IEtudiantRepository
  ) {}

  async execute(userId: string, criteria: SearchCriteria) {
    // Récupérer l'université de l'étudiant
    const etudiant = await this.etudiantRepository.findByUserId(userId);
    if (!etudiant || !etudiant.universite) {
      throw ApiError.badRequest('Veuillez d\'abord renseigner votre université dans votre profil');
    }

    // Pour l'instant, on recherche dans la même ville
    // TODO: Implémenter la recherche par proximité géographique avec latitude/longitude
    const result = await this.annonceRepository.search({
      ...criteria,
      isPublic: true,
      ville: etudiant.universite.includes('Libreville') ? 'Libreville' : 
            etudiant.universite.includes('Port-Gentil') ? 'Port-Gentil' :
            etudiant.universite.includes('Franceville') ? 'Franceville' : undefined,
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
        distance: this.calculateDistance(etudiant.universite, annonce.adresse.ville), // Approximation
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

  private calculateDistance(universite: string, ville: string): string {
    // Approximation simple - à améliorer avec vraie géolocalisation
    if (universite.includes(ville)) {
      return '< 5 km';
    }
    return 'Distance non calculée';
  }
}
