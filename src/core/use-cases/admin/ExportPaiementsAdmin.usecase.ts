import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';

export interface ExportPaiementsAdminInput {
  format: 'CSV' | 'PDF';
  dateDebut?: Date;
  dateFin?: Date;
}

export class ExportPaiementsAdminUseCase {
  constructor(private paiementRepository: IPaiementRepository) {}

  async execute(input: ExportPaiementsAdminInput): Promise<string> {
    let paiements = await this.paiementRepository.findAll();

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
      throw new Error('Export PDF non encore implémenté');
    }
  }

  private generateCSV(paiements: any[]): string {
    const headers = [
      'ID',
      'Réservation ID',
      'Locataire ID',
      'Propriétaire ID',
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
      p.locataireId,
      p.proprietaireId,
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
