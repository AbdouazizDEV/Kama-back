import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class GetStatutVerificationProprietaireUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }
    if (user.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    // TODO: Récupérer le statut depuis une table de vérification KYC
    // Pour l'instant, on utilise estVerifie de l'utilisateur
    return {
      estVerifie: user.estVerifie,
      estActif: user.estActif,
      dateVerification: null, // À implémenter avec une table dédiée
      documentsUploades: {
        pieceIdentite: false, // À implémenter
        justificatifDomicile: false, // À implémenter
      },
    };
  }
}
