import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class GetAnnonceDetailProprietaireUseCase {
  constructor(
    private annonceRepository: IAnnonceRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(annonceId: string, proprietaireId: string) {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const annonce = await this.annonceRepository.findById(annonceId);
    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    if (annonce.proprietaireId !== proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à consulter cette annonce');
    }

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
      dateDisponibilite: annonce.dateDisponibilite,
      statutModeration: annonce.statutModeration,
      nombreVues: annonce.nombreVues,
      dateCreation: annonce.dateCreation,
      dateModification: annonce.dateModification,
    };
  }
}
