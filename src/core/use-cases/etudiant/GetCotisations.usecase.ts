import { IMutuelleRepository } from '@/core/domain/repositories/IMutuelleRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class GetCotisationsUseCase {
  constructor(
    private mutuelleRepository: IMutuelleRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.typeUtilisateur !== UserType.ETUDIANT) {
      throw ApiError.forbidden('Accès réservé aux étudiants');
    }

    const mutuelle = await this.mutuelleRepository.findByUserId(userId);
    if (!mutuelle) {
      throw ApiError.notFound('Vous n\'avez pas d\'adhésion à la mutuelle');
    }

    const cotisations = await this.mutuelleRepository.findCotisationsByMutuelleId(mutuelle.id);

    return cotisations.map((cotisation) => ({
      id: cotisation.id,
      mois: cotisation.mois,
      annee: cotisation.annee,
      montant: cotisation.montant.getMontant(),
      statut: cotisation.statut,
      datePaiement: cotisation.datePaiement,
      referenceTransaction: cotisation.referenceTransaction,
      dateCreation: cotisation.dateCreation,
    }));
  }
}
