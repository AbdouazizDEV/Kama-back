import { IMutuelleRepository } from '@/core/domain/repositories/IMutuelleRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { Cotisation } from '@/core/domain/entities/Cotisation.entity';
import { Prix } from '@/core/domain/value-objects/Prix.vo';
import { StatutCotisation } from '@/core/domain/entities/Cotisation.entity';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { randomUUID } from 'crypto';

export interface PayerCotisationInput {
  userId: string;
  mois: number;
  annee: number;
  referenceTransaction: string;
}

export class PayerCotisationUseCase {
  constructor(
    private mutuelleRepository: IMutuelleRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: PayerCotisationInput): Promise<Cotisation> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.typeUtilisateur !== UserType.ETUDIANT) {
      throw ApiError.forbidden('Accès réservé aux étudiants');
    }

    const mutuelle = await this.mutuelleRepository.findByUserId(input.userId);
    if (!mutuelle || !mutuelle.isActive()) {
      throw ApiError.notFound('Vous n\'avez pas d\'adhésion active à la mutuelle');
    }

    // Vérifier si la cotisation existe déjà
    let cotisation = await this.mutuelleRepository.findCotisationByMutuelleIdAndMoisAnnee(
      mutuelle.id,
      input.mois,
      input.annee
    );

    if (!cotisation) {
      // Créer une nouvelle cotisation (montant fixe de 5000 FCFA par mois)
      const montant = new Prix(5000);
      cotisation = new Cotisation(
        randomUUID(),
        mutuelle.id,
        montant,
        input.mois,
        input.annee,
        null,
        StatutCotisation.EN_ATTENTE,
        null,
        new Date(),
        new Date()
      );
    }

    // Payer la cotisation
    cotisation.payer(input.referenceTransaction);
    await this.mutuelleRepository.updateCotisation(cotisation);

    return cotisation;
  }
}
