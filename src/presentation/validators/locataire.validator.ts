import { z } from 'zod';

// Validators pour la gestion du profil
export const updateProfilSchema = z.object({
  nom: z.string().min(2).max(100).optional(),
  prenom: z.string().min(2).max(100).optional(),
  telephone: z.string().regex(/^\+?[0-9]{8,15}$/).optional(),
});

// Validators pour la recherche d'annonces
export const searchAnnoncesLocataireSchema = z.object({
  typeBien: z.enum(['APPARTEMENT', 'MAISON', 'TERRAIN', 'VEHICULE']).optional(),
  ville: z.string().min(1).optional(),
  quartier: z.string().min(1).optional(),
  prixMin: z.coerce.number().min(0).optional(),
  prixMax: z.coerce.number().min(0).optional(),
  nombrePiecesMin: z.coerce.number().int().min(1).optional(),
  superficieMin: z.coerce.number().min(0).optional(),
  estMeuble: z.coerce.boolean().optional(),
  equipements: z.array(z.string()).optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  sortBy: z.enum(['dateCreation', 'prix', 'nombreVues']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// Validators pour les réservations
export const createReservationSchema = z.object({
  annonceId: z.string().uuid(),
  dateDebut: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: 'Date de début invalide' }
  ),
  dateFin: z.string().refine(
    (val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    },
    { message: 'Date de fin invalide' }
  ),
  nombrePersonnes: z.number().int().min(1).max(20),
  message: z.string().max(1000).optional(),
});

export const annulerReservationSchema = z.object({
  motif: z.string().min(5).max(500).optional(),
});

// Validators pour les paiements
export const createPaiementSchema = z.object({
  reservationId: z.string().uuid(),
  methodePaiement: z.enum(['AIRTEL_MONEY', 'MOOV_MONEY', 'STRIPE', 'ESPECE']),
  montant: z.number().positive(),
  referenceTransaction: z.string().optional(),
});

// Validators pour les messages
export const sendMessageSchema = z.object({
  reservationId: z.string().uuid(),
  destinataireId: z.string().uuid(),
  contenu: z.string().min(1).max(5000),
});

// Validators pour les avis
export const createAvisSchema = z.object({
  reservationId: z.string().uuid(),
  note: z.number().int().min(1).max(5),
  commentaire: z.string().min(10).max(1000),
});

export const updateAvisSchema = z.object({
  note: z.number().int().min(1).max(5).optional(),
  commentaire: z.string().min(10).max(1000).optional(),
});
