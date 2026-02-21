import { IAnnonceRepository } from '../../domain/repositories/IAnnonceRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { Annonce, TypeBien } from '../../domain/entities/Annonce.entity';
import { Prix } from '../../domain/value-objects/Prix.vo';
import { Adresse } from '../../domain/value-objects/Adresse.vo';
import { ApiError } from '@/shared/utils/ApiError';
import { StatutModeration } from '@/shared/constants/statuses.constant';
import { randomUUID } from 'crypto';

export interface CreateAnnonceInput {
  proprietaireId: string;
  titre: string;
  description: string;
  typeBien: TypeBien;
  categorieBien: string;
  prix: number;
  caution: number;
  ville: string;
  quartier: string;
  adresseComplete: string;
  latitude?: number;
  longitude?: number;
  superficie?: number;
  nombrePieces?: number;
  estMeuble: boolean;
  equipements: string[];
  photos?: string[];
  dateDisponibilite: Date;
}

export class CreateAnnonceUseCase {
  constructor(
    private annonceRepository: IAnnonceRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: CreateAnnonceInput): Promise<Annonce> {
    // Vérifier que le propriétaire existe
    const proprietaire = await this.userRepository.findById(input.proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Propriétaire');
    }

    // Vérifier que c'est bien un propriétaire
    if (proprietaire.typeUtilisateur !== 'PROPRIETAIRE') {
      throw ApiError.forbidden('Seuls les propriétaires peuvent créer des annonces');
    }

    // Créer les value objects
    const prix = new Prix(input.prix);
    const caution = new Prix(input.caution);
    const adresse = new Adresse(
      input.ville,
      input.quartier,
      input.adresseComplete,
      input.latitude || null,
      input.longitude || null
    );

    // Créer l'annonce
    const annonce = new Annonce(
      randomUUID(),
      input.proprietaireId,
      input.titre,
      input.description,
      input.typeBien,
      input.categorieBien,
      prix,
      caution,
      adresse,
      input.superficie || null,
      input.nombrePieces || null,
      input.estMeuble,
      input.equipements,
      input.photos || [],
      false, // pas encore disponible avant publication
      input.dateDisponibilite,
      new Date(),
      new Date(),
      0, // nombre de vues
      StatutModeration.EN_ATTENTE
    );

    // Ne pas publier automatiquement - l'annonce sera publiée après l'upload des photos
    // annonce.publish();

    // Sauvegarder
    await this.annonceRepository.save(annonce);

    return annonce;
  }
}
