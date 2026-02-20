import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export class GetAnnonceDetailUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(annonceId: string) {
    const annonce = await this.annonceRepository.findById(annonceId);

    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    // Vérifier que l'annonce est approuvée et disponible
    if (annonce.statutModeration !== StatutModeration.APPROUVE || !annonce.estDisponible) {
      throw ApiError.notFound('Annonce non disponible');
    }

    // Incrémenter le nombre de vues
    await this.annonceRepository.incrementViews(annonceId);

    return {
      id: annonce.id,
      titre: annonce.titre,
      description: annonce.description,
      typeBien: annonce.typeBien,
      categorieBien: annonce.categorieBien,
      prix: annonce.prix.getMontant(),
      caution: annonce.caution.getMontant(),
      ville: annonce.adresse.ville,
      quartier: annonce.adresse.quartier,
      adresseComplete: annonce.adresse.adresseComplete,
      latitude: annonce.adresse.latitude,
      longitude: annonce.adresse.longitude,
      superficie: annonce.superficie,
      nombrePieces: annonce.nombrePieces,
      estMeuble: annonce.estMeuble,
      equipements: annonce.equipements,
      photos: annonce.photos,
      estDisponible: annonce.estDisponible,
      nombreVues: annonce.nombreVues,
      dateCreation: annonce.dateCreation,
    };
  }
}
