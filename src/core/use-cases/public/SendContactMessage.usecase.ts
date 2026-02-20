import { IEmailService } from '../../domain/services/IEmailService';
import { env } from '@/config/env.config';

export interface SendContactMessageInput {
  nom: string;
  email: string;
  sujet: string;
  message: string;
  telephone?: string;
}

export class SendContactMessageUseCase {
  constructor(private emailService: IEmailService) {}

  async execute(input: SendContactMessageInput): Promise<void> {
    const emailContent = `
Nouveau message de contact depuis le site Kama

Nom: ${input.nom}
Email: ${input.email}
${input.telephone ? `Téléphone: ${input.telephone}` : ''}
Sujet: ${input.sujet}

Message:
${input.message}

---
Ce message a été envoyé depuis le formulaire de contact du site Kama.
    `.trim();

    // Envoyer l'email au support
    await this.emailService.sendEmail({
      to: env.email.supportEmail,
      subject: `[Contact] ${input.sujet}`,
      text: emailContent,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${input.nom}</p>
        <p><strong>Email:</strong> ${input.email}</p>
        ${input.telephone ? `<p><strong>Téléphone:</strong> ${input.telephone}</p>` : ''}
        <p><strong>Sujet:</strong> ${input.sujet}</p>
        <p><strong>Message:</strong></p>
        <p>${(input.message || '').replace(/\n/g, '<br>')}</p>
      `,
    });

    // Envoyer une confirmation à l'utilisateur
    await this.emailService.sendEmail({
      to: input.email,
      subject: 'Confirmation de réception - Kama',
      text: `Bonjour ${input.nom},\n\nNous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.\n\nCordialement,\nL'équipe Kama`,
      html: `
        <h2>Confirmation de réception</h2>
        <p>Bonjour ${input.nom},</p>
        <p>Nous avons bien reçu votre message et nous vous répondrons dans les plus brefs délais.</p>
        <p>Cordialement,<br>L'équipe Kama</p>
      `,
    });
  }
}
