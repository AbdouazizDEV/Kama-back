import { z } from 'zod';

// Validators pour la gestion du profil
export const updateProfilProprietaireSchema = z.object({
  nom: z.string().min(2).max(100).optional(),
  prenom: z.string().min(2).max(100).optional(),
  telephone: z.string().regex(/^\+?[0-9]{8,15}$/).optional(),
});

// Validators pour la gestion des annonces
export const createAnnonceProprietaireSchema = z.object({
  titre: z.string().min(5).max(200),
  description: z.string().min(50).max(5000),
  typeBien: z.enum(['APPARTEMENT', 'MAISON', 'TERRAIN', 'VEHICULE']),
  categorieBien: z.string().min(1).max(100),
  prix: z.number().positive(),
  caution: z.number().min(0),
  ville: z.string().min(1).max(100),
  quartier: z.string().min(1).max(100),
  adresseComplete: z.string().min(5).max(500),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  superficie: z.number().positive().optional(),
  nombrePieces: z.number().int().positive().optional(),
  estMeuble: z.boolean(),
  equipements: z.array(z.string()),
  dateDisponibilite: z.string().datetime(),
});

export const updateAnnonceProprietaireSchema = createAnnonceProprietaireSchema.partial();

// Validators pour les réservations
export const refuserReservationSchema = z.object({
  motif: z.string().max(500).optional(),
});

// Validators pour les paiements
export const restituerCautionSchema = z.object({
  reservationId: z.string().uuid(),
  referenceTransaction: z.string().max(100).optional(),
});

// Validators pour la messagerie
export const sendMessageProprietaireSchema = z.object({
  reservationId: z.string().uuid(),
  destinataireId: z.string().uuid(),
  contenu: z.string().min(1).max(5000),
});

// Validators pour les exports
export const exportPaiementsSchema = z.object({
  format: z.enum(['CSV', 'PDF']),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
});

// Validators pour le dashboard
export const dashboardRevenusSchema = z.object({
  periode: z.enum(['mois', 'annee']).optional(),
});
