import { IPaymentService, PaymentMetadata, PaymentResult } from '@/core/domain/services/IPaymentService';
import { Prix } from '@/core/domain/value-objects/Prix.vo';
import { MethodePaiement } from '@/core/domain/entities/Paiement.entity';
import { env } from '@/config/env.config';

export class StripeService implements IPaymentService {
  async initiatePayment(
    amount: Prix,
    method: MethodePaiement,
    metadata: PaymentMetadata
  ): Promise<PaymentResult> {
    if (method !== MethodePaiement.STRIPE) {
      throw new Error('Méthode de paiement non supportée');
    }

    // TODO: Implémenter l'intégration avec Stripe
    // Nécessite: npm install stripe
    const transactionId = `stripe_${Date.now()}`;

    return {
      transactionId,
      status: 'pending',
      redirectUrl: `${env.app.frontendUrl}/payment/stripe?transaction=${transactionId}`,
      message: 'Paiement Stripe initié',
    };
  }

  async validatePayment(transactionId: string): Promise<boolean> {
    // TODO: Vérifier le statut du paiement via l'API Stripe
    return true;
  }

  async refundPayment(transactionId: string, amount: Prix): Promise<boolean> {
    // TODO: Implémenter le remboursement via l'API Stripe
    return true;
  }
}
