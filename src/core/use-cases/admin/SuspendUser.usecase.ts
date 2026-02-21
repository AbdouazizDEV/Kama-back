import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';

export interface SuspendUserInput {
  userId: string;
  motif?: string;
  duree?: number; // en jours
}

export class SuspendUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(input: SuspendUserInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (!user.estActif) {
      throw ApiError.conflict('Le compte utilisateur est déjà suspendu');
    }

    user.deactivate();
    await this.userRepository.update(user);

    // TODO: Implémenter la logique de suspension temporaire avec durée si nécessaire
    // Pour l'instant, on désactive simplement le compte
  }
}
