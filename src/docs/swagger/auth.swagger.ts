/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - nom
 *         - prenom
 *         - telephone
 *         - typeUtilisateur
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: jean.dupont@example.com
 *         password:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: SecureP@ssw0rd123
 *         nom:
 *           type: string
 *           example: Dupont
 *         prenom:
 *           type: string
 *           example: Jean
 *         telephone:
 *           type: string
 *           example: "+241062345678"
 *         typeUtilisateur:
 *           type: string
 *           enum: [LOCATAIRE, PROPRIETAIRE, ETUDIANT]
 *           example: LOCATAIRE
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: jean.dupont@example.com
 *         password:
 *           type: string
 *           format: password
 *           example: SecureP@ssw0rd123
 *
 *     VerifyEmailRequest:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: Token OTP (ancienne méthode)
 *           example: "abc123def456..."
 *         accessToken:
 *           type: string
 *           description: Access token depuis la redirection Supabase (recommandé)
 *           example: "eyJhbGciOiJFUzI1NiIsImtpZCI6..."
 *         type:
 *           type: string
 *           enum: [email, signup, recovery]
 *           default: signup
 *
 *     ResendVerificationRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: jean.dupont@example.com
 *
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *
 *     ForgotPasswordRequest:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         email:
 *           type: string
 *           format: email
 *           example: jean.dupont@example.com
 *
 *     ResetPasswordRequest:
 *       type: object
 *       required:
 *         - token
 *         - newPassword
 *       properties:
 *         token:
 *           type: string
 *           example: "abc123def456..."
 *         newPassword:
 *           type: string
 *           format: password
 *           minLength: 8
 *           example: NewSecureP@ssw0rd123
 *
 *     UserResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         email:
 *           type: string
 *           format: email
 *         nom:
 *           type: string
 *         prenom:
 *           type: string
 *         telephone:
 *           type: string
 *         photoProfil:
 *           type: string
 *           nullable: true
 *         typeUtilisateur:
 *           type: string
 *           enum: [LOCATAIRE, PROPRIETAIRE, ETUDIANT, ADMIN]
 *         estActif:
 *           type: boolean
 *         estVerifie:
 *           type: boolean
 *         dateInscription:
 *           type: string
 *           format: date-time
 *
 *     SessionResponse:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         expiresAt:
 *           type: number
 *         expiresIn:
 *           type: number
 *
 * tags:
 *   - name: Authentification
 *     description: Endpoints d'authentification et de gestion de session
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Créer un nouveau compte utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: Inscription réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     email:
 *                       type: string
 *                     nom:
 *                       type: string
 *                     prenom:
 *                       type: string
 *                     typeUtilisateur:
 *                       type: string
 *                     emailVerified:
 *                       type: boolean
 *                 message:
 *                   type: string
 *                   example: Inscription réussie. Veuillez vérifier votre email.
 *       400:
 *         description: Erreur de validation
 *       409:
 *         description: Email déjà utilisé
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Obtenir l'URL de redirection pour l'authentification Google
 *     tags: [Authentification]
 *     parameters:
 *       - in: query
 *         name: redirectTo
 *         schema:
 *           type: string
 *           format: uri
 *         required: false
 *         description: URL de redirection après authentification (optionnel)
 *         example: http://localhost:3001/auth/callback
 *     responses:
 *       200:
 *         description: URL d'authentification Google générée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     authUrl:
 *                       type: string
 *                       format: uri
 *                       example: https://hzeiyyzopquxmgxpuhpo.supabase.co/auth/v1/authorize?provider=google&...
 *                 message:
 *                   type: string
 *                   example: URL d'authentification Google générée
 *       500:
 *         description: Erreur serveur
 */

/**
 * @swagger
 * /api/auth/google/callback:
 *   get:
 *     summary: Callback après authentification Google
 *     tags: [Authentification]
 *     parameters:
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         required: true
 *         description: Code d'autorisation retourné par Google
 *       - in: query
 *         name: error
 *         schema:
 *           type: string
 *         required: false
 *         description: Erreur éventuelle retournée par Google
 *     responses:
 *       200:
 *         description: Authentification Google réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserResponse'
 *                     session:
 *                       $ref: '#/components/schemas/SessionResponse'
 *                 message:
 *                   type: string
 *                   example: Authentification Google réussie
 *       400:
 *         description: Code manquant ou erreur d'authentification
 *       401:
 *         description: Erreur lors de l'échange du code
 */

/**
 * @swagger
 * /api/auth/verify-email:
 *   post:
 *     summary: Vérifier l'email via le token reçu
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmailRequest'
 *     responses:
 *       200:
 *         description: Email vérifié avec succès
 *       400:
 *         description: Token invalide ou expiré
 */

/**
 * @swagger
 * /api/auth/resend-verification:
 *   post:
 *     summary: Renvoyer l'email de vérification
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendVerificationRequest'
 *     responses:
 *       200:
 *         description: Email de vérification envoyé (si l'email existe)
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Se connecter avec email et mot de passe
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserResponse'
 *                     session:
 *                       $ref: '#/components/schemas/SessionResponse'
 *       401:
 *         description: Email ou mot de passe incorrect
 *       403:
 *         description: Compte désactivé ou email non vérifié
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Se déconnecter et invalider le token
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 *       401:
 *         description: Non authentifié
 */

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Rafraîchir le token JWT
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *     responses:
 *       200:
 *         description: Token rafraîchi avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SessionResponse'
 *       401:
 *         description: Token de rafraîchissement invalide
 */

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Demander la réinitialisation du mot de passe
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Email de réinitialisation envoyé (si l'email existe)
 */

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe avec le token
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Token invalide ou mot de passe invalide
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Obtenir les informations de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserResponse'
 *       401:
 *         description: Non authentifié
 */

/**
 * @swagger
 * /api/auth/check:
 *   get:
 *     summary: Vérifier si le token est valide
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valide
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     valid:
 *                       type: boolean
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         email:
 *                           type: string
 *                         typeUtilisateur:
 *                           type: string
 *       401:
 *         description: Token invalide
 */
