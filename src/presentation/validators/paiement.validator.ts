import { z } from 'zod';

export const initiatePaiementSchema = z.object({
  reservationId: z.string().uuid('ID de réservation invalide'),
  methodePaiement: z.enum(['AIRTEL_MONEY', 'MOOV_MONEY', 'STRIPE', 'ESPECE']),
});

export type InitiatePaiementDTO = z.infer<typeof initiatePaiementSchema>;
