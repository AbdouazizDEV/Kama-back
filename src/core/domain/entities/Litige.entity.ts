export enum StatutLitige {
  OUVERT = 'OUVERT',
  EN_COURS = 'EN_COURS',
  RESOLU = 'RESOLU',
  FERME = 'FERME',
}

export enum TypeLitige {
  RESERVATION = 'RESERVATION',
  PAIEMENT = 'PAIEMENT',
  ANNONCE = 'ANNONCE',
  AUTRE = 'AUTRE',
}

export class Litige {
  constructor(
    public readonly id: string,
    public readonly reservationId: string | null,
    public readonly locataireId: string,
    public readonly proprietaireId: string,
    public readonly type: TypeLitige,
    public readonly description: string,
    public readonly statut: StatutLitige,
    public readonly dateCreation: Date,
    public dateModification: Date,
    public resolution: string | null = null,
    public commentaires: Array<{ auteurId: string; contenu: string; date: Date }> = []
  ) {}

  resolve(resolution: string): void {
    if (this.statut === StatutLitige.RESOLU || this.statut === StatutLitige.FERME) {
      throw new Error('Le litige est déjà résolu ou fermé');
    }
    this.statut = StatutLitige.RESOLU;
    this.resolution = resolution;
    this.dateModification = new Date();
  }

  close(): void {
    this.statut = StatutLitige.FERME;
    this.dateModification = new Date();
  }

  addComment(auteurId: string, contenu: string): void {
    this.commentaires.push({
      auteurId,
      contenu,
      date: new Date(),
    });
    this.dateModification = new Date();
  }
}
