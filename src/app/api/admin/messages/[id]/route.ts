import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { DeleteMessageAdminUseCase } from '@/core/use-cases/admin/DeleteMessageAdmin.usecase';
import { SupabaseMessageRepository } from '@/infrastructure/database/repositories/SupabaseMessageRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const messageRepository = new SupabaseMessageRepository();
const deleteMessageAdminUseCase = new DeleteMessageAdminUseCase(messageRepository);

/**
 * @swagger
 * /api/admin/messages/{id}:
 *   delete:
 *     summary: Supprimer un message inapproprié
 *     tags: [Administrateur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Message supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Message non trouvé
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async () => {
    try {
      await deleteMessageAdminUseCase.execute(params.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Message supprimé avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
