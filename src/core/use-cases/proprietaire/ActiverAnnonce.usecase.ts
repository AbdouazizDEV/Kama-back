import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export class ActiverAnnonceProprietaireUseCase {
  constructor(
    private annonceRepository: IAnnonceRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(annonceId: string, proprietaireId: string): Promise<void> {
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
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à modifier cette annonce');
    }

    if (annonce.statutModeration !== StatutModeration.APPROUVE) {
      throw ApiError.conflict('L\'annonce doit être approuvée avant d\'être activée');
    }

    if (annonce.photos.length === 0) {
      throw ApiError.conflict('L\'annonce doit avoir au moins une photo pour être activée');
    }

    annonce.markAsAvailable();
    await this.annonceRepository.update(annonce);
  }
}
