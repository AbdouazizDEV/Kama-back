import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';
import { StatutPaiement } from '@/shared/constants/statuses.constant';

export class GetStatistiquesPaiementsProprietaireUseCase {
  constructor(
    private paiementRepository: IPaiementRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(proprietaireId: string) {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const paiements = await this.paiementRepository.findByProprietaire(proprietaireId);

    const paiementsValides = paiements.filter((p) => p.statut === StatutPaiement.VALIDE);
    const paiementsEnAttente = paiements.filter((p) => p.statut === StatutPaiement.EN_ATTENTE);
    const paiementsEchoues = paiements.filter((p) => p.statut === StatutPaiement.ECHOUE);

    const revenusTotal = paiementsValides.reduce((sum, p) => sum + p.montant.getMontant(), 0);
    const revenusMensuel = this.calculerRevenusMensuel(paiementsValides);
    const revenusAnnuel = this.calculerRevenusAnnuel(paiementsValides);

    return {
      total: paiements.length,
      valides: paiementsValides.length,
      enAttente: paiementsEnAttente.length,
      echoues: paiementsEchoues.length,
      revenus: {
        total: revenusTotal,
        mensuel: revenusMensuel,
        annuel: revenusAnnuel,
      },
      parMethode: this.grouperParMethode(paiementsValides),
    };
  }

  private calculerRevenusMensuel(paiements: any[]): number {
    const maintenant = new Date();
    const debutMois = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
    return paiements
      .filter((p) => p.dateValidation && new Date(p.dateValidation) >= debutMois)
      .reduce((sum, p) => sum + p.montant.getMontant(), 0);
  }

  private calculerRevenusAnnuel(paiements: any[]): number {
    const maintenant = new Date();
    const debutAnnee = new Date(maintenant.getFullYear(), 0, 1);
    return paiements
      .filter((p) => p.dateValidation && new Date(p.dateValidation) >= debutAnnee)
      .reduce((sum, p) => sum + p.montant.getMontant(), 0);
  }

  private grouperParMethode(paiements: any[]): Record<string, number> {
    const groupes: Record<string, number> = {};
    paiements.forEach((p) => {
      groupes[p.methodePaiement] = (groupes[p.methodePaiement] || 0) + p.montant.getMontant();
    });
    return groupes;
  }
}
