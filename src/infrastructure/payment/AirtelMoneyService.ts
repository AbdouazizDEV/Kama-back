import { IPaymentService, PaymentMetadata, PaymentResult } from '@/core/domain/services/IPaymentService';
import { Prix } from '@/core/domain/value-objects/Prix.vo';
import { MethodePaiement } from '@/core/domain/entities/Paiement.entity';
import { env } from '@/config/env.config';

export class AirtelMoneyService implements IPaymentService {
  async initiatePayment(
    amount: Prix,
    method: MethodePaiement,
    metadata: PaymentMetadata
  ): Promise<PaymentResult> {
    if (method !== MethodePaiement.AIRTEL_MONEY) {
      throw new Error('Méthode de paiement non supportée');
    }

    // TODO: Implémenter l'intégration avec l'API Airtel Money
    // Pour l'instant, on simule
    const transactionId = `airtel_${Date.now()}`;

    return {
      transactionId,
      status: 'pending',
      message: 'Paiement Airtel Money initié',
    };
  }

  async validatePayment(transactionId: string): Promise<boolean> {
    // TODO: Vérifier le statut du paiement via l'API Airtel Money
    return true;
  }

  async refundPayment(transactionId: string, amount: Prix): Promise<boolean> {
    // TODO: Implémenter le remboursement via l'API Airtel Money
    return true;
  }
}
