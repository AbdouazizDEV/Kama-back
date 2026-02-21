import { Prix } from '../value-objects/Prix.vo';
import { StatutReservation } from '@/shared/constants/statuses.constant';

export class Reservation {
  constructor(
    public readonly id: string,
    public readonly annonceId: string,
    public readonly locataireId: string,
    public readonly proprietaireId: string,
    public dateDebut: Date,
    public dateFin: Date,
    public nombrePersonnes: number,
    public prixTotal: Prix,
    public caution: Prix,
    public message: string | null,
    public readonly dateCreation: Date,
    public dateModification: Date,
    public statut: StatutReservation
  ) {
    // Validation des dates
    if (dateDebut >= dateFin) {
      throw new Error('La date de fin doit être postérieure à la date de début');
    }
    // Permettre les dates futures (au moins aujourd'hui)
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);
    const dateDebutNormalisee = new Date(dateDebut);
    dateDebutNormalisee.setHours(0, 0, 0, 0);
    if (dateDebutNormalisee < aujourdhui) {
      throw new Error('La date de début ne peut pas être dans le passé');
    }
    if (nombrePersonnes < 1) {
      throw new Error('Le nombre de personnes doit être au moins 1');
    }
  }

  accept(): void {
    if (this.statut !== StatutReservation.EN_ATTENTE) {
      throw new Error('Seules les réservations en attente peuvent être acceptées');
    }
    this.statut = StatutReservation.ACCEPTEE;
    this.dateModification = new Date();
  }

  reject(): void {
    if (this.statut !== StatutReservation.EN_ATTENTE) {
      throw new Error('Seules les réservations en attente peuvent être rejetées');
    }
    this.statut = StatutReservation.REJETEE;
    this.dateModification = new Date();
  }

  cancel(): void {
    if (this.statut === StatutReservation.TERMINEE) {
      throw new Error('Une réservation terminée ne peut pas être annulée');
    }
    this.statut = StatutReservation.ANNULEE;
    this.dateModification = new Date();
  }

  complete(): void {
    if (this.statut !== StatutReservation.ACCEPTEE) {
      throw new Error('Seules les réservations acceptées peuvent être terminées');
    }
    if (new Date() < this.dateFin) {
      throw new Error('La réservation ne peut être terminée qu\'après la date de fin');
    }
    this.statut = StatutReservation.TERMINEE;
    this.dateModification = new Date();
  }

  updateDates(dateDebut: Date, dateFin: Date): void {
    if (this.statut !== StatutReservation.EN_ATTENTE) {
      throw new Error('Seules les réservations en attente peuvent être modifiées');
    }
    if (dateDebut >= dateFin) {
      throw new Error('La date de fin doit être postérieure à la date de début');
    }
    this.dateDebut = dateDebut;
    this.dateFin = dateFin;
    this.dateModification = new Date();
  }

  getDurationInDays(): number {
    const diffTime = this.dateFin.getTime() - this.dateDebut.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
