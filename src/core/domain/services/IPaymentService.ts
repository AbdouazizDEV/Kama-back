import { Prix } from '../value-objects/Prix.vo';
import { MethodePaiement } from '../entities/Paiement.entity';

export interface IPaymentService {
  initiatePayment(
    amount: Prix,
    method: MethodePaiement,
    metadata: PaymentMetadata
  ): Promise<PaymentResult>;
  validatePayment(transactionId: string): Promise<boolean>;
  refundPayment(transactionId: string, amount: Prix): Promise<boolean>;
}

export interface PaymentMetadata {
  reservationId: string;
  locataireId: string;
  proprietaireId: string;
  description?: string;
}

export interface PaymentResult {
  transactionId: string;
  status: 'pending' | 'success' | 'failed';
  redirectUrl?: string;
  message?: string;
}
