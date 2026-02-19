import { Prix } from '../value-objects/Prix.vo';
import { Adresse } from '../value-objects/Adresse.vo';
import { StatutModeration } from '@/shared/constants/statuses.constant';

export enum TypeBien {
  APPARTEMENT = 'APPARTEMENT',
  MAISON = 'MAISON',
  TERRAIN = 'TERRAIN',
  VEHICULE = 'VEHICULE',
}

export class Annonce {
  constructor(
    public readonly id: string,
    public readonly proprietaireId: string,
    public titre: string,
    public description: string,
    public readonly typeBien: TypeBien,
    public categorieBien: string,
    public prix: Prix,
    public caution: Prix,
    public adresse: Adresse,
    public superficie: number | null,
    public nombrePieces: number | null,
    public estMeuble: boolean,
    public equipements: string[],
    public photos: string[],
    public estDisponible: boolean,
    public dateDisponibilite: Date,
    public readonly dateCreation: Date,
    public dateModification: Date,
    public nombreVues: number,
    public statutModeration: StatutModeration
  ) {}

  publish(): void {
    if (this.photos.length === 0) {
      throw new Error('Au moins une photo est requise pour publier');
    }
    if (this.photos.length < 5) {
      throw new Error('Au moins 5 photos sont recommandées');
    }
    if (!this.titre || this.titre.trim().length === 0) {
      throw new Error('Le titre est requis');
    }
    if (!this.description || this.description.trim().length < 50) {
      throw new Error('La description doit contenir au moins 50 caractères');
    }
    this.estDisponible = true;
    this.statutModeration = StatutModeration.EN_ATTENTE;
  }

  approve(): void {
    this.statutModeration = StatutModeration.APPROUVE;
  }

  reject(): void {
    this.statutModeration = StatutModeration.REJETE;
    this.estDisponible = false;
  }

  incrementViews(): void {
    this.nombreVues++;
  }

  updatePrice(newPrice: Prix): void {
    this.prix = newPrice;
    this.dateModification = new Date();
  }

  addPhoto(photoUrl: string): void {
    if (this.photos.length >= 20) {
      throw new Error('Maximum 20 photos par annonce');
    }
    if (!this.photos.includes(photoUrl)) {
      this.photos.push(photoUrl);
    }
  }

  removePhoto(photoUrl: string): void {
    this.photos = this.photos.filter((url) => url !== photoUrl);
  }

  updateEquipements(equipements: string[]): void {
    this.equipements = [...equipements];
    this.dateModification = new Date();
  }

  markAsUnavailable(): void {
    this.estDisponible = false;
  }

  markAsAvailable(): void {
    if (this.statutModeration === StatutModeration.APPROUVE) {
      this.estDisponible = true;
    } else {
      throw new Error('L\'annonce doit être approuvée avant d\'être disponible');
    }
  }
}
