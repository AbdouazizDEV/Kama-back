import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { ListLitigesUseCase } from '@/core/use-cases/admin/ListLitiges.usecase';
import { SupabaseLitigeRepository } from '@/infrastructure/database/repositories/SupabaseLitigeRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { listLitigesSchema } from '@/presentation/validators/admin.validator';

const litigeRepository = new SupabaseLitigeRepository();
const listLitigesUseCase = new ListLitigesUseCase(litigeRepository);

/**
 * @swagger
 * /api/admin/litiges:
 *   get:
 *     summary: Lister tous les litiges
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
 *           enum: [OUVERT, EN_COURS, RESOLU, FERME]
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [RESERVATION, PAIEMENT, ANNONCE, AUTRE]
 *     responses:
 *       200:
 *         description: Liste des litiges récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       501:
 *         description: Fonctionnalité non encore implémentée (modèle Litige à créer)
 */
export async function GET(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, listLitigesSchema);

      const result = await listLitigesUseCase.execute(validated);

      return NextResponse.json(
        ApiResponse.success(result, 'Liste des litiges récupérée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
