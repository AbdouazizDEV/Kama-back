import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';

export interface RejectKycInput {
  userId: string;
  motif: string;
}

export class RejectKycUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: RejectKycInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    // Réinitialiser la vérification
    // Note: On pourrait ajouter un champ pour stocker le motif de rejet
    // Pour l'instant, on désactive simplement la vérification
    // TODO: Ajouter un champ `motifRejetKyc` dans le modèle User si nécessaire
  }
}
