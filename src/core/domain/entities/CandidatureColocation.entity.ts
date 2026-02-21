export enum StatutCandidature {
  EN_ATTENTE = 'EN_ATTENTE',
  ACCEPTEE = 'ACCEPTEE',
  REJETEE = 'REJETEE',
}

export class CandidatureColocation {
  constructor(
    public readonly id: string,
    public readonly colocationId: string,
    public readonly candidatId: string,
    public message: string | null,
    public statut: StatutCandidature,
    public readonly dateCreation: Date,
    public dateModification: Date
  ) {}

  accepter(): void {
    if (this.statut !== StatutCandidature.EN_ATTENTE) {
      throw new Error('Seules les candidatures en attente peuvent être acceptées');
    }
    this.statut = StatutCandidature.ACCEPTEE;
    this.dateModification = new Date();
  }

  rejeter(): void {
    if (this.statut !== StatutCandidature.EN_ATTENTE) {
      throw new Error('Seules les candidatures en attente peuvent être rejetées');
    }
    this.statut = StatutCandidature.REJETEE;
    this.dateModification = new Date();
  }

  isPending(): boolean {
    return this.statut === StatutCandidature.EN_ATTENTE;
  }

  isAccepted(): boolean {
    return this.statut === StatutCandidature.ACCEPTEE;
  }
}
