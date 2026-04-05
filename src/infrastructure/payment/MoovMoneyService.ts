import { IPaymentService, PaymentMetadata, PaymentResult } from '@/core/domain/services/IPaymentService';
import { Prix } from '@/core/domain/value-objects/Prix.vo';
import { MethodePaiement } from '@/core/domain/entities/Paiement.entity';

export class MoovMoneyService implements IPaymentService {
  async initiatePayment(
    _amount: Prix,
    method: MethodePaiement,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _metadata: PaymentMetadata
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async validatePayment(_transactionId: string): Promise<boolean> {
    // TODO: Vérifier le statut du paiement via l'API Moov Money
    return true;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async refundPayment(_transactionId: string, _amount: Prix): Promise<boolean> {
    // TODO: Implémenter le remboursement via l'API Moov Money
    return true;
  }
}
