import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetConversationUseCase } from '@/core/use-cases/locataire/GetConversation.usecase';
import { SupabaseMessageRepository } from '@/infrastructure/database/repositories/SupabaseMessageRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const messageRepository = new SupabaseMessageRepository();
const reservationRepository = new SupabaseReservationRepository();
const getConversationUseCase = new GetConversationUseCase(
  messageRepository,
  reservationRepository
);

/**
 * @swagger
 * /api/locataire/messages/{conversationId}:
 *   get:
 *     summary: Consulter une conversation complète
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la réservation (conversation)
 *     responses:
 *       200:
 *         description: Conversation récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Réservation non trouvée
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const { conversationId } = params;
      const conversation = await getConversationUseCase.execute(conversationId, req.user.id);

      return NextResponse.json(
        ApiResponse.success(conversation, 'Conversation récupérée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
