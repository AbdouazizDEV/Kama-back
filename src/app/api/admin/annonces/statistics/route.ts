import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetAnnoncesStatisticsUseCase } from '@/core/use-cases/admin/GetAnnoncesStatistics.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const annonceRepository = new SupabaseAnnonceRepository();
const getAnnoncesStatisticsUseCase = new GetAnnoncesStatisticsUseCase(annonceRepository);

/**
 * @swagger
 * /api/admin/annonces/statistics:
 *   get:
 *     summary: Statistiques globales des annonces
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
      const statistics = await getAnnoncesStatisticsUseCase.execute();

      return NextResponse.json(
        ApiResponse.success(statistics, 'Statistiques récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
