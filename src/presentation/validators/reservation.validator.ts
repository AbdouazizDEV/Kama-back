import { z } from 'zod';

export const createReservationSchema = z.object({
  annonceId: z.string().uuid('ID d\'annonce invalide'),
  dateDebut: z.string().datetime(),
  dateFin: z.string().datetime(),
  nombrePersonnes: z.number().int().positive('Le nombre de personnes doit être positif'),
  message: z.string().max(1000, 'Le message ne peut pas dépasser 1000 caractères').optional(),
}).refine(
  (data) => new Date(data.dateFin) > new Date(data.dateDebut),
  {
    message: 'La date de fin doit être postérieure à la date de début',
    path: ['dateFin'],
  }
);

export type CreateReservationDTO = z.infer<typeof createReservationSchema>;
