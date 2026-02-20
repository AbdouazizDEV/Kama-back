import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ListConversationsUseCase } from '@/core/use-cases/locataire/ListConversations.usecase';
import { SendMessageUseCase } from '@/core/use-cases/locataire/SendMessage.usecase';
import { SupabaseMessageRepository } from '@/infrastructure/database/repositories/SupabaseMessageRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { sendMessageSchema } from '@/presentation/validators/locataire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const messageRepository = new SupabaseMessageRepository();
const reservationRepository = new SupabaseReservationRepository();
const listConversationsUseCase = new ListConversationsUseCase(
  messageRepository,
  reservationRepository
);
const sendMessageUseCase = new SendMessageUseCase(messageRepository, reservationRepository);

/**
 * @swagger
 * /api/locataire/messages:
 *   get:
 *     summary: Lister toutes mes conversations
 *     tags: [Locataire]
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
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
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
 * /api/locataire/messages:
 *   post:
 *     summary: Envoyer un message à un propriétaire
 *     tags: [Locataire]
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
 *       404:
 *         description: Réservation non trouvée
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const validated = await validateRequest(req, sendMessageSchema);
      const message = await sendMessageUseCase.execute({
        reservationId: validated.reservationId,
        expediteurId: req.user.id,
        destinataireId: validated.destinataireId,
        contenu: validated.contenu,
      });

      return NextResponse.json(
        ApiResponse.success(
          {
            id: message.id,
            reservationId: message.reservationId,
            contenu: message.contenu,
            dateEnvoi: message.dateEnvoi,
          },
          'Message envoyé avec succès'
        ),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
