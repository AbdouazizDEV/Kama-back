import { IEmailService, ReservationEmailDetails } from '@/core/domain/services/IEmailService';
import { env } from '@/config/env.config';
import sgMail from '@sendgrid/mail';
import { logger } from '@/shared/utils/logger';

export class SendGridEmailService implements IEmailService {
  constructor() {
    if (env.email.sendgridApiKey) {
      sgMail.setApiKey(env.email.sendgridApiKey);
    } else {
      logger.warn('SENDGRID_API_KEY non configurée. Les emails ne seront pas envoyés.');
    }
  }

  private async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    if (!env.email.sendgridApiKey) {
      logger.warn(`Email non envoyé à ${to} (SendGrid non configuré). Sujet: ${subject}`);
      console.log(`[SIMULATION] Email envoyé à ${to}:`, {
        subject,
        text: text.substring(0, 100) + '...',
      });
      return;
    }

    const msg = {
      to,
      from: env.email.fromEmail,
      subject,
      text,
      html: html || text,
    };

    try {
      await sgMail.send(msg);
      logger.info(`Email envoyé à ${to}. Sujet: ${subject}`);
    } catch (error: any) {
      logger.error(`Erreur lors de l'envoi de l'email à ${to}: ${error.message}`, error);
      if (error.response) {
        logger.error('Détails SendGrid:', error.response.body);
      }
      throw new Error(`Échec de l'envoi de l'email: ${error.message}`);
    }
  }

  async sendEmail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void> {
    await this.sendMail(options.to, options.subject, options.text, options.html);
  }

  async sendVerificationEmail(email: string, userId: string): Promise<void> {
    const verificationLink = `${env.app.frontendUrl}/verify-email?token=${userId}`;
    const subject = 'Vérifiez votre adresse email pour Kama';
    const text = `Bonjour,\n\nVeuillez vérifier votre adresse email en cliquant sur ce lien: ${verificationLink}\n\nL'équipe Kama`;
    const html = `
      <p>Bonjour,</p>
      <p>Veuillez vérifier votre adresse email en cliquant sur ce lien: <a href="${verificationLink}">Vérifier mon email</a></p>
      <p>L'équipe Kama</p>
    `;
    await this.sendMail(email, subject, text, html);
  }

  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetLink = `${env.app.frontendUrl}/reset-password?token=${resetToken}`;
    const subject = 'Réinitialisation de votre mot de passe Kama';
    const text = `Bonjour,\n\nVous avez demandé à réinitialiser votre mot de passe. Cliquez sur ce lien: ${resetLink}\n\nSi vous n'avez pas demandé cela, ignorez cet email.\n\nL'équipe Kama`;
    const html = `
      <p>Bonjour,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur ce lien: <a href="${resetLink}">Réinitialiser mon mot de passe</a></p>
      <p>Si vous n'avez pas demandé cela, veuillez ignorer cet email.</p>
      <p>L'équipe Kama</p>
    `;
    await this.sendMail(email, subject, text, html);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = `Bienvenue sur Kama, ${name}!`;
    const text = `Bonjour ${name},\n\nBienvenue sur Kama, votre plateforme de location au Gabon!\n\nL'équipe Kama`;
    const html = `
      <p>Bonjour ${name},</p>
      <p>Bienvenue sur Kama, votre plateforme de location au Gabon!</p>
      <p>L'équipe Kama</p>
    `;
    await this.sendMail(email, subject, text, html);
  }

  async sendReservationConfirmationEmail(
    email: string,
    reservationDetails: ReservationEmailDetails
  ): Promise<void> {
    const subject = `Confirmation de votre réservation #${reservationDetails.reservationId}`;
    const text = `Bonjour,\n\nVotre réservation pour l'annonce "${reservationDetails.annonceTitre}" du ${reservationDetails.dateDebut.toLocaleDateString()} au ${reservationDetails.dateFin.toLocaleDateString()} a été confirmée.\nMontant total: ${reservationDetails.prixTotal} FCFA.\n\nL'équipe Kama`;
    const html = `
      <p>Bonjour,</p>
      <p>Votre réservation pour l'annonce "<strong>${reservationDetails.annonceTitre}</strong>" du <strong>${reservationDetails.dateDebut.toLocaleDateString()}</strong> au <strong>${reservationDetails.dateFin.toLocaleDateString()}</strong> a été confirmée.</p>
      <p>Montant total: <strong>${reservationDetails.prixTotal} FCFA</strong>.</p>
      <p>L'équipe Kama</p>
    `;
    await this.sendMail(email, subject, text, html);
  }
}
