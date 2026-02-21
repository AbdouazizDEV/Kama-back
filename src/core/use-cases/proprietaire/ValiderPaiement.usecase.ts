import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { StatutPaiement } from '@/shared/constants/statuses.constant';

export class ValiderPaiementProprietaireUseCase {
  constructor(
    private paiementRepository: IPaiementRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(paiementId: string, proprietaireId: string): Promise<void> {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const paiement = await this.paiementRepository.findById(paiementId);
    if (!paiement) {
      throw ApiError.notFound('Paiement');
    }

    if (paiement.proprietaireId !== proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à valider ce paiement');
    }

    if (paiement.statut !== StatutPaiement.EN_ATTENTE) {
      throw ApiError.conflict('Seuls les paiements en attente peuvent être validés');
    }

    paiement.validate();
    await this.paiementRepository.update(paiement);
  }
}
