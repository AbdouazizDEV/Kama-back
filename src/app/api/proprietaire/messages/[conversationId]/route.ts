import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetConversationProprietaireUseCase } from '@/core/use-cases/proprietaire/GetConversation.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { SupabaseMessageRepository } from '@/infrastructure/database/repositories/SupabaseMessageRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const reservationRepository = new SupabaseReservationRepository();
const messageRepository = new SupabaseMessageRepository();
const getConversationUseCase = new GetConversationProprietaireUseCase(
  messageRepository,
  userRepository,
  reservationRepository
);

/**
 * @swagger
 * /api/proprietaire/messages/{conversationId}:
 *   get:
 *     summary: Consulter une conversation complète
 *     tags: [Propriétaire]
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
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { conversationId: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const conversation = await getConversationUseCase.execute(params.conversationId, req.user.id);

      return NextResponse.json(
        ApiResponse.success(conversation, 'Conversation récupérée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
