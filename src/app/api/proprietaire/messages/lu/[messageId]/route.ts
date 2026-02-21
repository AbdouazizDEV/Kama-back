import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { MarkMessageAsReadProprietaireUseCase } from '@/core/use-cases/proprietaire/MarkMessageAsRead.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseMessageRepository } from '@/infrastructure/database/repositories/SupabaseMessageRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const messageRepository = new SupabaseMessageRepository();
const markMessageAsReadUseCase = new MarkMessageAsReadProprietaireUseCase(
  messageRepository,
  userRepository
);

/**
 * @swagger
 * /api/proprietaire/messages/lu/{messageId}:
 *   put:
 *     summary: Marquer un message comme lu
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Message marqué comme lu avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      await markMessageAsReadUseCase.execute(params.messageId, req.user.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Message marqué comme lu avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
