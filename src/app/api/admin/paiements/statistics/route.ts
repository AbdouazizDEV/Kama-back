import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetPaiementsStatisticsUseCase } from '@/core/use-cases/admin/GetPaiementsStatistics.usecase';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const paiementRepository = new SupabasePaiementRepository();
const getPaiementsStatisticsUseCase = new GetPaiementsStatisticsUseCase(paiementRepository);

/**
 * @swagger
 * /api/admin/paiements/statistics:
 *   get:
 *     summary: Statistiques financières globales
 *     tags: [Administrateur]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async () => {
    try {
      const statistics = await getPaiementsStatisticsUseCase.execute();

      return NextResponse.json(
        ApiResponse.success(statistics, 'Statistiques récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
