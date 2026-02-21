import { IAnnonceRepository } from '@/core/domain/repositories/IAnnonceRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class DeleteAnnonceProprietaireUseCase {
  constructor(
    private annonceRepository: IAnnonceRepository,
    private userRepository: IUserRepository,
    private reservationRepository: IReservationRepository
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
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à supprimer cette annonce');
    }

    // Vérifier s'il y a des réservations actives
    const reservations = await this.reservationRepository.findByAnnonce(annonceId);
    const reservationsActives = reservations.filter(
      (r) => r.statut === 'EN_ATTENTE' || r.statut === 'ACCEPTEE'
    );

    if (reservationsActives.length > 0) {
      throw ApiError.conflict(
        'Impossible de supprimer cette annonce car elle a des réservations actives'
      );
    }

    await this.annonceRepository.delete(annonceId);
  }
}
