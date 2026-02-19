import { z } from 'zod';

export const createAnnonceSchema = z.object({
  titre: z.string().min(5, 'Le titre doit contenir au moins 5 caractères'),
  description: z.string().min(50, 'La description doit contenir au moins 50 caractères'),
  typeBien: z.enum(['APPARTEMENT', 'MAISON', 'TERRAIN', 'VEHICULE']),
  categorieBien: z.string().min(1, 'La catégorie est requise'),
  prix: z.number().positive('Le prix doit être positif'),
  caution: z.number().min(0, 'La caution ne peut pas être négative'),
  ville: z.string().min(1, 'La ville est requise'),
  quartier: z.string().min(1, 'Le quartier est requis'),
  adresseComplete: z.string().min(5, 'L\'adresse complète est requise'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  superficie: z.number().positive().optional(),
  nombrePieces: z.number().int().positive().optional(),
  estMeuble: z.boolean(),
  equipements: z.array(z.string()),
  photos: z.array(z.string().url()).min(1, 'Au moins une photo est requise'),
  dateDisponibilite: z.string().datetime(),
});

export const updateAnnonceSchema = createAnnonceSchema.partial();

export const searchAnnoncesSchema = z.object({
  typeBien: z.enum(['APPARTEMENT', 'MAISON', 'TERRAIN', 'VEHICULE']).optional(),
  ville: z.string().optional(),
  quartier: z.string().optional(),
  prixMin: z.number().min(0).optional(),
  prixMax: z.number().min(0).optional(),
  nombrePiecesMin: z.number().int().positive().optional(),
  superficieMin: z.number().positive().optional(),
  estMeuble: z.boolean().optional(),
  equipements: z.array(z.string()).optional(),
  page: z.number().int().positive().optional(),
  limit: z.number().int().positive().max(100).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export type CreateAnnonceDTO = z.infer<typeof createAnnonceSchema>;
export type UpdateAnnonceDTO = z.infer<typeof updateAnnonceSchema>;
export type SearchAnnoncesDTO = z.infer<typeof searchAnnoncesSchema>;
