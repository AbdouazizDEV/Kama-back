export const ERROR_CODES = {
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
} as const;

export const ERROR_MESSAGES = {
  USER_NOT_FOUND: 'Utilisateur introuvable',
  EMAIL_ALREADY_EXISTS: 'Cet email est déjà utilisé',
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  ACCOUNT_DISABLED: 'Votre compte a été désactivé',
  EMAIL_NOT_VERIFIED: 'Veuillez vérifier votre email avant de vous connecter',
  TOKEN_INVALID: 'Token invalide ou expiré',
  TOKEN_MISSING: 'Token manquant',
  ANNOUNCE_NOT_FOUND: 'Annonce introuvable',
  RESERVATION_NOT_FOUND: 'Réservation introuvable',
  PAYMENT_NOT_FOUND: 'Paiement introuvable',
  UNAUTHORIZED_ACTION: 'Action non autorisée',
  INSUFFICIENT_PERMISSIONS: 'Permissions insuffisantes',
} as const;
