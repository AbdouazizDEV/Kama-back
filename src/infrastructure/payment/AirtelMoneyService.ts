import { IPaymentService, PaymentMetadata, PaymentResult } from '@/core/domain/services/IPaymentService';
import { Prix } from '@/core/domain/value-objects/Prix.vo';
import { MethodePaiement } from '@/core/domain/entities/Paiement.entity';

export class AirtelMoneyService implements IPaymentService {
  async initiatePayment(
    amount: Prix,
    method: MethodePaiement,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _metadata: PaymentMetadata
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validatePayment(_transactionId: string): Promise<boolean> {
    // TODO: Vérifier le statut du paiement via l'API Airtel Money
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async refundPayment(_transactionId: string, _amount: Prix): Promise<boolean> {
    // TODO: Implémenter le remboursement via l'API Airtel Money
    return true;
  }
}
