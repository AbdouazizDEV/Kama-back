import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class ListAnnoncesProprietaireUseCase {
  constructor(
    private annonceRepository: IAnnonceRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(proprietaireId: string) {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const annonces = await this.annonceRepository.findByProprietaire(proprietaireId);

    return annonces.map((annonce) => ({
      id: annonce.id,
      titre: annonce.titre,
      description: annonce.description,
      typeBien: annonce.typeBien,
      categorieBien: annonce.categorieBien,
      prix: annonce.prix.getMontant(),
      caution: annonce.caution.getMontant(),
      ville: annonce.adresse.ville,
      quartier: annonce.adresse.quartier,
      photos: annonce.photos,
      estDisponible: annonce.estDisponible,
      statutModeration: annonce.statutModeration,
      nombreVues: annonce.nombreVues,
      dateCreation: annonce.dateCreation,
      dateModification: annonce.dateModification,
    }));
  }
}
