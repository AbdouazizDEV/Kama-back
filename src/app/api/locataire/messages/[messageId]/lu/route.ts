import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { MarkMessageAsReadUseCase } from '@/core/use-cases/locataire/MarkMessageAsRead.usecase';
import { SupabaseMessageRepository } from '@/infrastructure/database/repositories/SupabaseMessageRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const messageRepository = new SupabaseMessageRepository();
const markMessageAsReadUseCase = new MarkMessageAsReadUseCase(messageRepository);

/**
 * @swagger
 * /api/locataire/messages/{messageId}/lu:
 *   put:
 *     summary: Marquer un message comme lu
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du message
 *     responses:
 *       200:
 *         description: Message marqué comme lu avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Message non trouvé
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const { messageId } = params;
      await markMessageAsReadUseCase.execute(messageId, req.user.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Message marqué comme lu avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
