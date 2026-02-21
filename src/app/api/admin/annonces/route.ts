import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { ListAnnoncesAdminUseCase } from '@/core/use-cases/admin/ListAnnoncesAdmin.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { listAnnoncesAdminSchema } from '@/presentation/validators/admin.validator';

const annonceRepository = new SupabaseAnnonceRepository();
const listAnnoncesAdminUseCase = new ListAnnoncesAdminUseCase(annonceRepository);

/**
 * @swagger
 * /api/admin/annonces:
 *   get:
 *     summary: Lister toutes les annonces (avec filtres)
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
 *         name: statutModeration
 *         schema:
 *           type: string
 *           enum: [EN_ATTENTE, APPROUVE, REJETE]
 *       - in: query
 *         name: proprietaireId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: ville
 *         schema:
 *           type: string
 *       - in: query
 *         name: typeBien
 *         schema:
 *           type: string
 *           enum: [APPARTEMENT, MAISON, TERRAIN, VEHICULE]
 *     responses:
 *       200:
 *         description: Liste des annonces récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, listAnnoncesAdminSchema);

      const result = await listAnnoncesAdminUseCase.execute(validated);

      return NextResponse.json(
        ApiResponse.success(result, 'Liste des annonces récupérée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
