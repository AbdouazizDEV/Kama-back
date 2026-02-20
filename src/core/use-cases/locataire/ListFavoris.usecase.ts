import { IFavoriRepository } from '@/core/domain/repositories/IFavoriRepository';
import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';

export class ListFavorisUseCase {
  constructor(
    private favoriRepository: IFavoriRepository,
    private annonceRepository: IAnnonceRepository
  ) {}

  async execute(userId: string) {
    const favoris = await this.favoriRepository.findByUser(userId);

    // Récupérer les détails des annonces
    const annonces = await Promise.all(
      favoris.map(async (favori) => {
        const annonce = await this.annonceRepository.findById(favori.annonceId);
        return {
          favori: {
            id: favori.id,
            dateAjout: favori.dateAjout,
          },
          annonce: annonce
            ? {
                id: annonce.id,
                titre: annonce.titre,
                description: annonce.description,
                typeBien: annonce.typeBien,
                prix: annonce.prix.getMontant(),
                ville: annonce.adresse.ville,
                quartier: annonce.adresse.quartier,
                photos: annonce.photos,
                estDisponible: annonce.estDisponible,
              }
            : null,
        };
      })
    );

    return annonces.filter((item) => item.annonce !== null);
  }
}
