import { Prix } from './value-objects/Prix.vo';

export enum StatutCotisation {
  EN_ATTENTE = 'EN_ATTENTE',
  PAYEE = 'PAYEE',
  EN_RETARD = 'EN_RETARD',
}

export class Cotisation {
  constructor(
    public readonly id: string,
    public readonly mutuelleId: string,
    public readonly montant: Prix,
    public readonly mois: number,
    public readonly annee: number,
    public datePaiement: Date | null,
    public statut: StatutCotisation,
    public referenceTransaction: string | null,
    public readonly dateCreation: Date,
    public dateModification: Date
  ) {
    if (mois < 1 || mois > 12) {
      throw new Error('Le mois doit être entre 1 et 12');
    }
    if (annee < 2020 || annee > 2100) {
      throw new Error('L\'année doit être valide');
    }
  }

  payer(referenceTransaction: string): void {
    if (this.statut === StatutCotisation.PAYEE) {
      throw new Error('Cette cotisation est déjà payée');
    }
    this.statut = StatutCotisation.PAYEE;
    this.datePaiement = new Date();
    this.referenceTransaction = referenceTransaction;
    this.dateModification = new Date();
  }

  marquerEnRetard(): void {
    if (this.statut === StatutCotisation.PAYEE) {
      throw new Error('Une cotisation payée ne peut pas être en retard');
    }
    this.statut = StatutCotisation.EN_RETARD;
    this.dateModification = new Date();
  }

  isPaid(): boolean {
    return this.statut === StatutCotisation.PAYEE;
  }

  isOverdue(): boolean {
    const now = new Date();
    const deadline = new Date(this.annee, this.mois - 1, 15); // 15 du mois
    return this.statut !== StatutCotisation.PAYEE && now > deadline;
  }
}
