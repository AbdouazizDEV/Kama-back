import { z } from 'zod';

// Validator pour la recherche d'annonces
export const searchAnnoncesSchema = z.object({
  typeBien: z.enum(['APPARTEMENT', 'MAISON', 'TERRAIN', 'VEHICULE']).optional(),
  ville: z.string().min(1).optional(),
  quartier: z.string().min(1).optional(),
  prixMin: z.coerce.number().min(0).optional(),
  prixMax: z.coerce.number().min(0).optional(),
  nombrePiecesMin: z.coerce.number().int().min(1).optional(),
  superficieMin: z.coerce.number().min(0).optional(),
  estMeuble: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['dateCreation', 'prix', 'nombreVues']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Validator pour la liste des annonces publiques
export const listPublicAnnoncesSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['dateCreation', 'prix', 'nombreVues']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Validator pour les quartiers (filtre par ville)
export const getQuartiersSchema = z.object({
  ville: z.string().min(1).optional(),
});

// Validator pour le contact
export const contactSchema = z.object({
  nom: z.string().min(2).max(100),
  email: z.string().email(),
  sujet: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
  telephone: z.string().regex(/^\+?[0-9]{8,15}$/).optional(),
});

// Validator pour la newsletter
export const newsletterSchema = z.object({
  email: z.string().email(),
});
