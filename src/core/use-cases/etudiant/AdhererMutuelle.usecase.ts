import { IMutuelleRepository } from '@/core/domain/repositories/IMutuelleRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { Mutuelle } from '@/core/domain/entities/Mutuelle.entity';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { randomUUID } from 'crypto';

export class AdhererMutuelleUseCase {
  constructor(
    private mutuelleRepository: IMutuelleRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(userId: string): Promise<Mutuelle> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.typeUtilisateur !== UserType.ETUDIANT) {
      throw ApiError.forbidden('Accès réservé aux étudiants');
    }

    // Vérifier si l'utilisateur a déjà une mutuelle
    const existingMutuelle = await this.mutuelleRepository.findByUserId(userId);
    if (existingMutuelle) {
      if (existingMutuelle.isActive()) {
        throw ApiError.conflict('Vous avez déjà une adhésion active à la mutuelle');
      }
      // Si la mutuelle existe mais n'est pas active, on ne peut pas créer une nouvelle
      // car il y a une contrainte unique sur userId. Il faudrait réactiver l'ancienne.
      throw ApiError.conflict('Vous avez déjà une adhésion à la mutuelle. Veuillez contacter le support pour réactiver votre adhésion.');
    }

    // Générer un numéro d'adhésion unique
    const numeroAdhesion = `MUT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;

    // Vérifier l'unicité du numéro
    const existingByNumero = await this.mutuelleRepository.findByNumeroAdhesion(numeroAdhesion);
    if (existingByNumero) {
      // Régénérer si collision (très rare)
      return this.execute(userId);
    }

    const mutuelle = new Mutuelle(
      randomUUID(),
      userId,
      numeroAdhesion,
      new Date(),
      null,
      true,
      new Date(),
      new Date()
    );

    await this.mutuelleRepository.save(mutuelle);
    return mutuelle;
  }
}
