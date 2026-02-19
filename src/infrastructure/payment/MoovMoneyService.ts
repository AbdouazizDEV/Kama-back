import { IPaymentService, PaymentMetadata, PaymentResult } from '@/core/domain/services/IPaymentService';
import { Prix } from '@/core/domain/value-objects/Prix.vo';
import { MethodePaiement } from '@/core/domain/entities/Paiement.entity';

export class MoovMoneyService implements IPaymentService {
  async initiatePayment(
    amount: Prix,
    method: MethodePaiement,
    metadata: PaymentMetadata
  ): Promise<PaymentResult> {
    if (method !== MethodePaiement.MOOV_MONEY) {
      throw new Error('Méthode de paiement non supportée');
    }

    // TODO: Implémenter l'intégration avec l'API Moov Money
    const transactionId = `moov_${Date.now()}`;

    return {
      transactionId,
      status: 'pending',
      message: 'Paiement Moov Money initié',
    };
  }

  async validatePayment(transactionId: string): Promise<boolean> {
    // TODO: Vérifier le statut du paiement via l'API Moov Money
    return true;
  }

  async refundPayment(transactionId: string, amount: Prix): Promise<boolean> {
    // TODO: Implémenter le remboursement via l'API Moov Money
    return true;
  }
}
