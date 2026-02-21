import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetFlaggedMessagesUseCase } from '@/core/use-cases/admin/GetFlaggedMessages.usecase';
import { SupabaseMessageRepository } from '@/infrastructure/database/repositories/SupabaseMessageRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { z } from 'zod';

const messageRepository = new SupabaseMessageRepository();
const getFlaggedMessagesUseCase = new GetFlaggedMessagesUseCase(messageRepository);

const flaggedMessagesSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
});

/**
 * @swagger
 * /api/admin/messages/flagged:
 *   get:
 *     summary: Lister les messages signalés
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
 *     responses:
 *       200:
 *         description: Liste des messages signalés récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, flaggedMessagesSchema);

      const result = await getFlaggedMessagesUseCase.execute(validated);

      return NextResponse.json(
        ApiResponse.success(result, 'Liste des messages signalés récupérée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
