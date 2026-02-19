import { IEmailService, ReservationEmailDetails } from '@/core/domain/services/IEmailService';
import { env } from '@/config/env.config';

// Note: Cette implémentation nécessite l'installation de @sendgrid/mail
// npm install @sendgrid/mail

export class SendGridEmailService implements IEmailService {
  async sendVerificationEmail(email: string, userId: string): Promise<void> {
    // TODO: Implémenter avec SendGrid
    // Pour l'instant, on simule l'envoi
    const verificationLink = `${env.app.frontendUrl}/verify-email?token=${userId}`;
    console.log(`Email de vérification envoyé à ${email}: ${verificationLink}`);
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    // TODO: Implémenter avec SendGrid
    const resetLink = `${env.app.frontendUrl}/reset-password?token=${resetToken}`;
    console.log(`Email de réinitialisation envoyé à ${email}: ${resetLink}`);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    // TODO: Implémenter avec SendGrid
    console.log(`Email de bienvenue envoyé à ${email} pour ${name}`);
  }

  async sendReservationConfirmationEmail(
    email: string,
    reservationDetails: ReservationEmailDetails
  ): Promise<void> {
    // TODO: Implémenter avec SendGrid
    console.log(
      `Email de confirmation de réservation envoyé à ${email} pour la réservation ${reservationDetails.reservationId}`
    );
  }
}
