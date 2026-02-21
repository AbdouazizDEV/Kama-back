import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { StatutPaiement } from '@/shared/constants/statuses.constant';

export class GetDashboardRevenusProprietaireUseCase {
  constructor(
    private userRepository: IUserRepository,
    private paiementRepository: IPaiementRepository
  ) {}

  async execute(proprietaireId: string, periode: 'mois' | 'annee' = 'mois') {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const paiements = await this.paiementRepository.findByProprietaire(proprietaireId);
    const paiementsValides = paiements.filter((p) => p.statut === StatutPaiement.VALIDE);

    if (periode === 'mois') {
      return this.genererDonneesMensuelles(paiementsValides);
    } else {
      return this.genererDonneesAnnuelles(paiementsValides);
    }
  }

  private genererDonneesMensuelles(paiements: any[]) {
    const maintenant = new Date();
    const donnees: Record<string, number> = {};

    // 12 derniers mois
    for (let i = 11; i >= 0; i--) {
      const date = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const moisCle = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      donnees[moisCle] = 0;
    }

    paiements.forEach((p) => {
      if (p.dateValidation) {
        const date = new Date(p.dateValidation);
        const moisCle = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (donnees[moisCle] !== undefined) {
          donnees[moisCle] += p.montant.getMontant();
        }
      }
    });

    return {
      periode: 'mois',
      donnees: Object.entries(donnees).map(([mois, montant]) => ({ mois, montant })),
    };
  }

  private genererDonneesAnnuelles(paiements: any[]) {
    const maintenant = new Date();
    const donnees: Record<string, number> = {};

    // 5 dernières années
    for (let i = 4; i >= 0; i--) {
      const annee = maintenant.getFullYear() - i;
      donnees[annee.toString()] = 0;
    }

    paiements.forEach((p) => {
      if (p.dateValidation) {
        const annee = new Date(p.dateValidation).getFullYear().toString();
        if (donnees[annee] !== undefined) {
          donnees[annee] += p.montant.getMontant();
        }
      }
    });

    return {
      periode: 'annee',
      donnees: Object.entries(donnees).map(([annee, montant]) => ({ annee, montant })),
    };
  }
}
