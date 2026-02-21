import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ListConversationsProprietaireUseCase } from '@/core/use-cases/proprietaire/ListConversations.usecase';
import { SendMessageProprietaireUseCase } from '@/core/use-cases/proprietaire/SendMessage.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { SupabaseMessageRepository } from '@/infrastructure/database/repositories/SupabaseMessageRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { sendMessageProprietaireSchema } from '@/presentation/validators/proprietaire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const reservationRepository = new SupabaseReservationRepository();
const messageRepository = new SupabaseMessageRepository();
const listConversationsUseCase = new ListConversationsProprietaireUseCase(
  messageRepository,
  userRepository,
  reservationRepository
);
const sendMessageUseCase = new SendMessageProprietaireUseCase(
  messageRepository,
  userRepository,
  reservationRepository
);

/**
 * @swagger
 * /api/proprietaire/messages:
 *   get:
 *     summary: Lister toutes mes conversations
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des conversations récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const conversations = await listConversationsUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(conversations, 'Conversations récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * @swagger
 * /api/proprietaire/messages:
 *   post:
 *     summary: Envoyer un message à un locataire
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *               - destinataireId
 *               - contenu
 *             properties:
 *               reservationId:
 *                 type: string
 *                 format: uuid
 *               destinataireId:
 *                 type: string
 *                 format: uuid
 *               contenu:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 5000
 *     responses:
 *       201:
 *         description: Message envoyé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const validated = await validateRequest(req, sendMessageProprietaireSchema);
      const message = await sendMessageUseCase.execute({
        reservationId: validated.reservationId,
        proprietaireId: req.user.id,
        destinataireId: validated.destinataireId,
        contenu: validated.contenu,
      });

      return NextResponse.json(
        ApiResponse.success({ id: message.id }, 'Message envoyé avec succès'),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
