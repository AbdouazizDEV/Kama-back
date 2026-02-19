export interface IEmailService {
  sendVerificationEmail(email: string, userId: string): Promise<void>;
  sendPasswordResetEmail(email: string, resetToken: string): Promise<void>;
  sendWelcomeEmail(email: string, name: string): Promise<void>;
  sendReservationConfirmationEmail(
    email: string,
    reservationDetails: ReservationEmailDetails
  ): Promise<void>;
}

export interface ReservationEmailDetails {
  reservationId: string;
  annonceTitre: string;
  dateDebut: Date;
  dateFin: Date;
  prixTotal: number;
}
