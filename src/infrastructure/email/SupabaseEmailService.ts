import { IEmailService, ReservationEmailDetails } from '@/core/domain/services/IEmailService';
import { supabaseAdmin } from '@/config/supabase.config';
import { env } from '@/config/env.config';
import { logger } from '@/shared/utils/logger';

/**
 * Service email utilisant Supabase
 * - Utilise Supabase Auth pour les emails d'authentification
 * - Utilise Supabase Edge Functions pour les emails personnalisés
 */
export class SupabaseEmailService implements IEmailService {
  /**
   * Envoie un email personnalisé via Supabase Edge Function
   * Note: Vous devez créer une Edge Function dans Supabase pour envoyer des emails personnalisés
   */
  private async sendCustomEmail(
    to: string,
    subject: string,
    text: string,
    html?: string
  ): Promise<void> {
    try {
      // Option 1: Utiliser Supabase Edge Function (recommandé)
      // Créez une Edge Function 'send-email' dans Supabase
      const { data, error } = await supabaseAdmin.functions.invoke('send-email', {
        body: {
          to,
          subject,
          text,
          html: html || text,
        },
      });

      if (error) {
        logger.error(`Erreur lors de l'envoi de l'email à ${to}: ${error.message}`, error);
        // Fallback: logger l'email si la fonction n'existe pas encore
        logger.warn(
          `Edge Function 'send-email' non disponible. Email simulé à ${to}. Créez la fonction dans Supabase.`
        );
        console.log(`[SIMULATION] Email envoyé à ${to}:`, {
          subject,
          text: text.substring(0, 100) + '...',
        });
        return;
      }

      logger.info(`Email envoyé à ${to} via Supabase. Sujet: ${subject}`);
    } catch (error: any) {
      logger.error(`Erreur lors de l'envoi de l'email à ${to}: ${error.message}`, error);
      // Fallback: logger l'email
      console.log(`[SIMULATION] Email envoyé à ${to}:`, {
        subject,
        text: text.substring(0, 100) + '...',
      });
    }
  }

  /**
   * Envoie un email personnalisé (contact, newsletter, etc.)
   */
  async sendEmail(options: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }): Promise<void> {
    await this.sendCustomEmail(options.to, options.subject, options.text, options.html);
  }

  /**
   * Envoie un email de vérification via Supabase Auth
   */
  async sendVerificationEmail(email: string, userId: string): Promise<void> {
    try {
      // Utiliser Supabase Auth pour renvoyer l'email de vérification
      const { data, error } = await supabaseAdmin.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${env.app.frontendUrl}/auth/verify-email`,
        },
      });

      if (error) {
        logger.error(`Erreur lors de l'envoi de l'email de vérification à ${email}: ${error.message}`);
        throw new Error(`Échec de l'envoi de l'email de vérification: ${error.message}`);
      }

      logger.info(`Email de vérification envoyé à ${email} via Supabase Auth`);
    } catch (error: any) {
      logger.error(`Erreur lors de l'envoi de l'email de vérification: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Envoie un email de réinitialisation de mot de passe via Supabase Auth
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    try {
      // Utiliser Supabase Auth pour envoyer l'email de réinitialisation
      const { data, error } = await supabaseAdmin.auth.resetPasswordForEmail(email, {
        redirectTo: `${env.app.frontendUrl}/auth/reset-password?token=${resetToken}`,
      });

      if (error) {
        logger.error(`Erreur lors de l'envoi de l'email de réinitialisation à ${email}: ${error.message}`);
        throw new Error(`Échec de l'envoi de l'email de réinitialisation: ${error.message}`);
      }

      logger.info(`Email de réinitialisation envoyé à ${email} via Supabase Auth`);
    } catch (error: any) {
      logger.error(`Erreur lors de l'envoi de l'email de réinitialisation: ${error.message}`, error);
      throw error;
    }
  }

  /**
   * Envoie un email de bienvenue (personnalisé)
   */
  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const subject = `Bienvenue sur Kama, ${name}!`;
    const text = `Bonjour ${name},\n\nBienvenue sur Kama, votre plateforme de location au Gabon!\n\nL'équipe Kama`;
    const html = `
      <p>Bonjour ${name},</p>
      <p>Bienvenue sur Kama, votre plateforme de location au Gabon!</p>
      <p>L'équipe Kama</p>
    `;
    await this.sendCustomEmail(email, subject, text, html);
  }

  /**
   * Envoie un email de confirmation de réservation (personnalisé)
   */
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
    await this.sendCustomEmail(email, subject, text, html);
  }
}
