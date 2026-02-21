import { z } from 'zod';

// Validators pour la gestion des utilisateurs
export const listUsersSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  typeUtilisateur: z.enum(['LOCATAIRE', 'PROPRIETAIRE', 'ETUDIANT', 'ADMIN']).optional(),
  estActif: z.string().optional().transform((val) => val === 'true'),
  estVerifie: z.string().optional().transform((val) => val === 'true'),
  search: z.string().optional(),
});

export const activateUserSchema = z.object({
  id: z.string().uuid(),
});

export const suspendUserSchema = z.object({
  id: z.string().uuid(),
  motif: z.string().max(500).optional(),
  duree: z.number().positive().optional(), // en jours
});

export const rejectKycSchema = z.object({
  motif: z.string().min(10).max(500),
});

// Validators pour la gestion des annonces
export const listAnnoncesAdminSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  statutModeration: z.enum(['EN_ATTENTE', 'APPROUVE', 'REJETE']).optional(),
  proprietaireId: z.string().uuid().optional(),
  ville: z.string().optional(),
  typeBien: z.enum(['APPARTEMENT', 'MAISON', 'TERRAIN', 'VEHICULE']).optional(),
});

export const approveAnnonceSchema = z.object({
  id: z.string().uuid(),
});

export const rejectAnnonceSchema = z.object({
  motif: z.string().min(10).max(500),
});

export const featureAnnonceSchema = z.object({
  featured: z.boolean(),
});

// Validators pour la gestion des réservations
export const listReservationsAdminSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  statut: z.enum(['EN_ATTENTE', 'ACCEPTEE', 'REJETEE', 'ANNULEE', 'TERMINEE']).optional(),
  locataireId: z.string().uuid().optional(),
  proprietaireId: z.string().uuid().optional(),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
});

export const cancelReservationSchema = z.object({
  motif: z.string().min(10).max(500),
});

// Validators pour la gestion des paiements
export const listPaiementsAdminSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  statut: z.enum(['EN_ATTENTE', 'VALIDE', 'ECHOUE', 'REMBOURSE']).optional(),
  locataireId: z.string().uuid().optional(),
  proprietaireId: z.string().uuid().optional(),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
});

export const refundPaiementSchema = z.object({
  motif: z.string().min(10).max(500),
  montant: z.number().positive().optional(),
});

export const exportPaiementsAdminSchema = z.object({
  format: z.enum(['CSV', 'PDF']),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
});

// Validators pour la gestion des litiges
export const listLitigesSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  statut: z.enum(['OUVERT', 'EN_COURS', 'RESOLU', 'FERME']).optional(),
  type: z.enum(['RESERVATION', 'PAIEMENT', 'ANNONCE', 'AUTRE']).optional(),
});

export const resolveLitigeSchema = z.object({
  resolution: z.string().min(10).max(1000),
  statut: z.enum(['RESOLU', 'FERME']),
});

export const commentLitigeSchema = z.object({
  commentaire: z.string().min(10).max(1000),
});

// Validators pour la messagerie
export const listMessagesAdminSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
  reservationId: z.string().uuid().optional(),
  expediteurId: z.string().uuid().optional(),
  destinataireId: z.string().uuid().optional(),
});

// Validators pour les rapports
export const customReportSchema = z.object({
  type: z.enum(['users', 'annonces', 'reservations', 'paiements', 'activite']),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
  filters: z.record(z.any()).optional(),
  format: z.enum(['JSON', 'CSV', 'PDF']).optional(),
});

// Validators pour la configuration
export const updateConfigSchema = z.object({
  key: z.string().min(1),
  value: z.any(),
});

export const listLogsSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 50)),
  level: z.enum(['error', 'warn', 'info', 'debug']).optional(),
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
});
