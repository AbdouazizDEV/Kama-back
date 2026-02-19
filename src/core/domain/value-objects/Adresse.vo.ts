export class Adresse {
  constructor(
    public readonly ville: string,
    public readonly quartier: string,
    public readonly adresseComplete: string,
    public readonly latitude: number | null = null,
    public readonly longitude: number | null = null
  ) {
    if (!ville || ville.trim().length === 0) {
      throw new Error('La ville est requise');
    }
    if (!quartier || quartier.trim().length === 0) {
      throw new Error('Le quartier est requis');
    }
    if (!adresseComplete || adresseComplete.trim().length === 0) {
      throw new Error('L\'adresse complète est requise');
    }

    // Valider les coordonnées GPS si fournies
    if (latitude !== null) {
      if (latitude < -90 || latitude > 90) {
        throw new Error('Latitude invalide (doit être entre -90 et 90)');
      }
    }
    if (longitude !== null) {
      if (longitude < -180 || longitude > 180) {
        throw new Error('Longitude invalide (doit être entre -180 et 180)');
      }
    }

    // Si une coordonnée est fournie, l'autre doit l'être aussi
    if ((latitude !== null && longitude === null) || (latitude === null && longitude !== null)) {
      throw new Error('Les deux coordonnées GPS doivent être fournies ensemble');
    }
  }

  getFullAddress(): string {
    return `${this.adresseComplete}, ${this.quartier}, ${this.ville}`;
  }

  hasCoordinates(): boolean {
    return this.latitude !== null && this.longitude !== null;
  }

  equals(other: Adresse): boolean {
    return (
      this.ville === other.ville &&
      this.quartier === other.quartier &&
      this.adresseComplete === other.adresseComplete &&
      this.latitude === other.latitude &&
      this.longitude === other.longitude
    );
  }
}
