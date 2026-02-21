import { z } from 'zod';

// Validators pour le profil étudiant
export const updateUniversiteSchema = z.object({
  universite: z.string().min(2).max(200),
  filiere: z.string().min(2).max(200),
  niveauEtude: z.enum(['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat']),
});

// Validators pour la recherche d'annonces étudiants
export const searchAnnoncesEtudiantsSchema = z.object({
  ville: z.string().min(1).optional(),
  quartier: z.string().min(1).optional(),
  prixMin: z.coerce.number().min(0).optional(),
  prixMax: z.coerce.number().min(0).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['dateCreation', 'prix', 'nombreVues']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

export const searchAnnoncesProximiteSchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const searchColocationsSchema = z.object({
  ville: z.string().min(1).optional(),
  nombrePlacesMin: z.coerce.number().int().min(1).optional(),
  placesDisponibles: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

// Validators pour la mutuelle
export const payerCotisationSchema = z.object({
  mois: z.number().int().min(1).max(12),
  annee: z.number().int().min(2020).max(2100),
  referenceTransaction: z.string().min(1).max(100),
});

// Validators pour la colocation
export const postulerColocationSchema = z.object({
  colocationId: z.string().uuid(),
  message: z.string().max(1000).optional(),
});

export const searchColocatairesSchema = z.object({
  universite: z.string().min(1).optional(),
  filiere: z.string().min(1).optional(),
  niveauEtude: z.enum(['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat']).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});
