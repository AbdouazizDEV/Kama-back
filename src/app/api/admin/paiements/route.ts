import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { ListPaiementsAdminUseCase } from '@/core/use-cases/admin/ListPaiementsAdmin.usecase';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { listPaiementsAdminSchema } from '@/presentation/validators/admin.validator';

const paiementRepository = new SupabasePaiementRepository();
const listPaiementsAdminUseCase = new ListPaiementsAdminUseCase(paiementRepository);

/**
 * @swagger
 * /api/admin/paiements:
 *   get:
 *     summary: Lister toutes les transactions
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
 *         name: statut
 *         schema:
 *           type: string
 *           enum: [EN_ATTENTE, VALIDE, ECHOUE, REMBOURSE]
 *       - in: query
 *         name: locataireId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: proprietaireId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Liste des paiements récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, listPaiementsAdminSchema);

      const result = await listPaiementsAdminUseCase.execute(validated);

      return NextResponse.json(
        ApiResponse.success(result, 'Liste des paiements récupérée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
