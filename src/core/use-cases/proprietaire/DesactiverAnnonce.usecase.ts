import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class DesactiverAnnonceProprietaireUseCase {
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

    annonce.markAsUnavailable();
    await this.annonceRepository.update(annonce);
  }
}
