import { IColocationRepository } from '@/core/domain/repositories/IColocationRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { CandidatureColocation, StatutCandidature } from '@/core/domain/entities/CandidatureColocation.entity';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { randomUUID } from 'crypto';

export interface PostulerColocationInput {
  userId: string;
  colocationId: string;
  message?: string;
}

export class PostulerColocationUseCase {
  constructor(
    private colocationRepository: IColocationRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: PostulerColocationInput): Promise<CandidatureColocation> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.typeUtilisateur !== UserType.ETUDIANT) {
      throw ApiError.forbidden('Accès réservé aux étudiants');
    }

    // Vérifier que la colocation existe et est active
    const colocation = await this.colocationRepository.findById(input.colocationId);
    if (!colocation) {
      throw ApiError.notFound('Colocation');
    }

    if (!colocation.hasAvailablePlaces()) {
      throw ApiError.conflict('Cette colocation n\'a plus de places disponibles');
    }

    // Vérifier qu'il n'y a pas déjà une candidature
    const existingCandidature = await this.colocationRepository.findCandidatureByColocationAndCandidat(
      input.colocationId,
      input.userId
    );

    if (existingCandidature) {
      if (existingCandidature.isAccepted()) {
        throw ApiError.conflict('Vous êtes déjà accepté dans cette colocation');
      }
      if (existingCandidature.isPending()) {
        throw ApiError.conflict('Vous avez déjà une candidature en attente pour cette colocation');
      }
    }

    // Créer la candidature
    const candidature = new CandidatureColocation(
      randomUUID(),
      input.colocationId,
      input.userId,
      input.message || null,
      StatutCandidature.EN_ATTENTE,
      new Date(),
      new Date()
    );

    await this.colocationRepository.saveCandidature(candidature);
    return candidature;
  }
}
