export class Colocation {
  constructor(
    public readonly id: string,
    public readonly annonceId: string,
    public readonly nombrePlaces: number,
    public placesDisponibles: number,
    public description: string | null,
    public regles: string[],
    public estActive: boolean,
    public readonly dateCreation: Date,
    public dateModification: Date
  ) {
    if (nombrePlaces < 1) {
      throw new Error('Le nombre de places doit être au moins 1');
    }
    if (placesDisponibles < 0 || placesDisponibles > nombrePlaces) {
      throw new Error('Le nombre de places disponibles est invalide');
    }
  }

  addRegle(regle: string): void {
    if (!this.regles.includes(regle)) {
      this.regles.push(regle);
      this.dateModification = new Date();
    }
  }

  removeRegle(regle: string): void {
    this.regles = this.regles.filter((r) => r !== regle);
    this.dateModification = new Date();
  }

  updatePlacesDisponibles(nombre: number): void {
    if (nombre < 0 || nombre > this.nombrePlaces) {
      throw new Error('Le nombre de places disponibles est invalide');
    }
    this.placesDisponibles = nombre;
    this.dateModification = new Date();
  }

  desactiver(): void {
    this.estActive = false;
    this.dateModification = new Date();
  }

  activer(): void {
    this.estActive = true;
    this.dateModification = new Date();
  }

  hasAvailablePlaces(): boolean {
    return this.estActive && this.placesDisponibles > 0;
  }
}
