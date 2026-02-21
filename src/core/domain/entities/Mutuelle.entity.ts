export class Mutuelle {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly numeroAdhesion: string,
    public readonly dateAdhesion: Date,
    public dateResiliation: Date | null,
    public estActive: boolean,
    public readonly dateCreation: Date,
    public dateModification: Date
  ) {}

  resiliate(): void {
    if (!this.estActive) {
      throw new Error('La mutuelle est déjà résiliée');
    }
    this.estActive = false;
    this.dateResiliation = new Date();
    this.dateModification = new Date();
  }

  isActive(): boolean {
    return this.estActive && this.dateResiliation === null;
  }
}
