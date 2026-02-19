import { IAnnonceRepository } from '../../domain/repositories/IAnnonceRepository';
import { Annonce } from '../../domain/entities/Annonce.entity';
import { Prix } from '../../domain/value-objects/Prix.vo';
import { Adresse } from '../../domain/value-objects/Adresse.vo';
import { ApiError } from '@/shared/utils/ApiError';

export interface UpdateAnnonceInput {
  annonceId: string;
  proprietaireId: string;
  titre?: string;
  description?: string;
  prix?: number;
  caution?: number;
  ville?: string;
  quartier?: string;
  adresseComplete?: string;
  latitude?: number;
  longitude?: number;
  superficie?: number;
  nombrePieces?: number;
  estMeuble?: boolean;
  equipements?: string[];
  photos?: string[];
  dateDisponibilite?: Date;
}

export class UpdateAnnonceUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: UpdateAnnonceInput): Promise<Annonce> {
    const annonce = await this.annonceRepository.findById(input.annonceId);
    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    // Vérifier que c'est le propriétaire
    if (annonce.proprietaireId !== input.proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à modifier cette annonce');
    }

    // Mettre à jour les champs
    if (input.titre) annonce.titre = input.titre;
    if (input.description) annonce.description = input.description;
    if (input.prix !== undefined) {
      annonce.prix = new Prix(input.prix);
      annonce.updatePrice(annonce.prix);
    }
    if (input.caution !== undefined) {
      annonce.caution = new Prix(input.caution);
    }
    if (input.superficie !== undefined) annonce.superficie = input.superficie;
    if (input.nombrePieces !== undefined) annonce.nombrePieces = input.nombrePieces;
    if (input.estMeuble !== undefined) annonce.estMeuble = input.estMeuble;
    if (input.equipements) annonce.updateEquipements(input.equipements);
    if (input.photos) {
      // Remplacer toutes les photos
      annonce.photos = input.photos;
    }
    if (input.dateDisponibilite) annonce.dateDisponibilite = input.dateDisponibilite;

    // Mettre à jour l'adresse si nécessaire
    if (input.ville || input.quartier || input.adresseComplete || input.latitude !== undefined || input.longitude !== undefined) {
      const newAdresse = new Adresse(
        input.ville || annonce.adresse.ville,
        input.quartier || annonce.adresse.quartier,
        input.adresseComplete || annonce.adresse.adresseComplete,
        input.latitude !== undefined ? input.latitude : annonce.adresse.latitude,
        input.longitude !== undefined ? input.longitude : annonce.adresse.longitude
      );
      annonce.adresse = newAdresse;
    }

    await this.annonceRepository.update(annonce);
    return annonce;
  }
}
