import { Prix } from '../value-objects/Prix.vo';
import { StatutPaiement } from '@/shared/constants/statuses.constant';

export enum MethodePaiement {
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  MOOV_MONEY = 'MOOV_MONEY',
  STRIPE = 'STRIPE',
  ESPECE = 'ESPECE',
}

export class Paiement {
  constructor(
    public readonly id: string,
    public readonly reservationId: string,
    public readonly locataireId: string,
    public readonly proprietaireId: string,
    public montant: Prix,
    public readonly methodePaiement: MethodePaiement,
    public readonly dateCreation: Date,
    public dateModification: Date,
    public statut: StatutPaiement,
    public referenceTransaction: string | null = null,
    public dateValidation: Date | null = null,
    public motifEchec: string | null = null
  ) {}

  validate(): void {
    if (this.statut !== StatutPaiement.EN_ATTENTE) {
      throw new Error('Seuls les paiements en attente peuvent être validés');
    }
    this.statut = StatutPaiement.VALIDE;
    this.dateValidation = new Date();
    this.dateModification = new Date();
  }

  fail(motif: string): void {
    if (this.statut !== StatutPaiement.EN_ATTENTE) {
      throw new Error('Seuls les paiements en attente peuvent échouer');
    }
    this.statut = StatutPaiement.ECHOUE;
    this.motifEchec = motif;
    this.dateModification = new Date();
  }

  refund(): void {
    if (this.statut !== StatutPaiement.VALIDE) {
      throw new Error('Seuls les paiements validés peuvent être remboursés');
    }
    this.statut = StatutPaiement.REMBOURSE;
    this.dateModification = new Date();
  }

  setReferenceTransaction(reference: string): void {
    this.referenceTransaction = reference;
    this.dateModification = new Date();
  }
}
