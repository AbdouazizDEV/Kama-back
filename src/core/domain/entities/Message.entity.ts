export class Message {
  constructor(
    public readonly id: string,
    public readonly reservationId: string,
    public readonly expediteurId: string,
    public readonly destinataireId: string,
    public contenu: string,
    public readonly dateEnvoi: Date,
    public estLu: boolean,
    public dateLecture: Date | null = null
  ) {
    if (!contenu || contenu.trim().length === 0) {
      throw new Error('Le contenu du message ne peut pas être vide');
    }
    if (contenu.length > 5000) {
      throw new Error('Le message ne peut pas dépasser 5000 caractères');
    }
  }

  markAsRead(): void {
    if (!this.estLu) {
      this.estLu = true;
      this.dateLecture = new Date();
    }
  }

  updateContent(newContent: string): void {
    if (!newContent || newContent.trim().length === 0) {
      throw new Error('Le contenu du message ne peut pas être vide');
    }
    if (newContent.length > 5000) {
      throw new Error('Le message ne peut pas dépasser 5000 caractères');
    }
    this.contenu = newContent;
  }
}
