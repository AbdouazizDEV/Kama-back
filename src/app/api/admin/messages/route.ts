import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { ListMessagesAdminUseCase } from '@/core/use-cases/admin/ListMessagesAdmin.usecase';
import { SupabaseMessageRepository } from '@/infrastructure/database/repositories/SupabaseMessageRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { listMessagesAdminSchema } from '@/presentation/validators/admin.validator';

const messageRepository = new SupabaseMessageRepository();
const listMessagesAdminUseCase = new ListMessagesAdminUseCase(messageRepository);

/**
 * @swagger
 * /api/admin/messages:
 *   get:
 *     summary: Consulter toutes les conversations (vue globale)
 *     tags: [Administrateur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: reservationId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: expediteurId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: destinataireId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Liste des messages récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, listMessagesAdminSchema);

      const result = await listMessagesAdminUseCase.execute(validated);

      return NextResponse.json(
        ApiResponse.success(result, 'Liste des messages récupérée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
