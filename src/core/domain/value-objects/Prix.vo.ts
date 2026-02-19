export class Prix {
  private readonly montant: number;
  private readonly devise: string;

  constructor(montant: number, devise = 'FCFA') {
    if (montant < 0) {
      throw new Error('Le prix ne peut pas être négatif');
    }
    if (!Number.isFinite(montant)) {
      throw new Error('Le prix doit être un nombre valide');
    }
    this.montant = Math.round(montant * 100) / 100; // Arrondir à 2 décimales
    this.devise = devise;
  }

  getMontant(): number {
    return this.montant;
  }

  getDevise(): string {
    return this.devise;
  }

  format(): string {
    return `${this.montant.toLocaleString('fr-FR')} ${this.devise}`;
  }

  equals(other: Prix): boolean {
    return this.montant === other.montant && this.devise === other.devise;
  }

  add(other: Prix): Prix {
    if (this.devise !== other.devise) {
      throw new Error('Impossible d\'additionner des prix avec des devises différentes');
    }
    return new Prix(this.montant + other.montant, this.devise);
  }

  subtract(other: Prix): Prix {
    if (this.devise !== other.devise) {
      throw new Error('Impossible de soustraire des prix avec des devises différentes');
    }
    return new Prix(this.montant - other.montant, this.devise);
  }

  multiply(factor: number): Prix {
    return new Prix(this.montant * factor, this.devise);
  }
}
