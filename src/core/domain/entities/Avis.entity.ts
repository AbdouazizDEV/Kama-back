export class Avis {
  constructor(
    public readonly id: string,
    public readonly reservationId: string,
    public readonly locataireId: string,
    public readonly proprietaireId: string,
    public note: number,
    public commentaire: string,
    public readonly dateCreation: Date,
    public dateModification: Date
  ) {
    if (note < 1 || note > 5) {
      throw new Error('La note doit être entre 1 et 5');
    }
    if (!commentaire || commentaire.trim().length < 10) {
      throw new Error('Le commentaire doit contenir au moins 10 caractères');
    }
    if (commentaire.length > 1000) {
      throw new Error('Le commentaire ne peut pas dépasser 1000 caractères');
    }
  }

  update(note?: number, commentaire?: string): void {
    if (note !== undefined) {
      if (note < 1 || note > 5) {
        throw new Error('La note doit être entre 1 et 5');
      }
      this.note = note;
    }
    if (commentaire !== undefined) {
      if (commentaire.trim().length < 10) {
        throw new Error('Le commentaire doit contenir au moins 10 caractères');
      }
      if (commentaire.length > 1000) {
        throw new Error('Le commentaire ne peut pas dépasser 1000 caractères');
      }
      this.commentaire = commentaire;
    }
    this.dateModification = new Date();
  }
}
