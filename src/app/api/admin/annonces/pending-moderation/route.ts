import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetPendingModerationAnnoncesUseCase } from '@/core/use-cases/admin/GetPendingModerationAnnonces.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { z } from 'zod';

const annonceRepository = new SupabaseAnnonceRepository();
const getPendingModerationAnnoncesUseCase = new GetPendingModerationAnnoncesUseCase(annonceRepository);

const pendingModerationSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 20)),
});

/**
 * @swagger
 * /api/admin/annonces/pending-moderation:
 *   get:
 *     summary: Lister les annonces en attente de modération
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
 *         description: Liste des annonces en attente récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, pendingModerationSchema);

      const result = await getPendingModerationAnnoncesUseCase.execute(validated);

      return NextResponse.json(
        ApiResponse.success(result, 'Liste des annonces en attente récupérée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
