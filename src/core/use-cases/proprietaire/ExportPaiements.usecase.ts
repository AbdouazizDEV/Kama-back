import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export interface ExportPaiementsInput {
  proprietaireId: string;
  format: 'CSV' | 'PDF';
  dateDebut?: Date;
  dateFin?: Date;
}

export class ExportPaiementsProprietaireUseCase {
  constructor(
    private paiementRepository: IPaiementRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: ExportPaiementsInput): Promise<string> {
    const proprietaire = await this.userRepository.findById(input.proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    let paiements = await this.paiementRepository.findByProprietaire(input.proprietaireId);

    // Filtrer par dates si fournies
    if (input.dateDebut) {
      paiements = paiements.filter((p) => p.dateCreation >= input.dateDebut!);
    }
    if (input.dateFin) {
      paiements = paiements.filter((p) => p.dateCreation <= input.dateFin!);
    }

    if (input.format === 'CSV') {
      return this.generateCSV(paiements);
    } else {
      // TODO: Implémenter la génération PDF
      throw ApiError.notImplemented('Export PDF non encore implémenté');
    }
  }

  private generateCSV(paiements: any[]): string {
    const headers = [
      'ID',
      'Réservation ID',
      'Montant',
      'Méthode',
      'Statut',
      'Référence',
      'Date Création',
      'Date Validation',
    ];

    const rows = paiements.map((p) => [
      p.id,
      p.reservationId,
      p.montant.getMontant(),
      p.methodePaiement,
      p.statut,
      p.referenceTransaction || '',
      p.dateCreation.toISOString(),
      p.dateValidation?.toISOString() || '',
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }
}
