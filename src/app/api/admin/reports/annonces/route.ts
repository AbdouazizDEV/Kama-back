import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetAnnoncesReportUseCase } from '@/core/use-cases/admin/GetAnnoncesReport.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const annonceRepository = new SupabaseAnnonceRepository();
const getAnnoncesReportUseCase = new GetAnnoncesReportUseCase(annonceRepository);

/**
 * @swagger
 * /api/admin/reports/annonces:
 *   get:
 *     summary: Rapport détaillé des annonces
 *     tags: [Administrateur]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rapport récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async () => {
    try {
      const report = await getAnnoncesReportUseCase.execute();

      return NextResponse.json(
        ApiResponse.success(report, 'Rapport récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
