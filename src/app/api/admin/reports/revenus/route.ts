import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetRevenusReportUseCase } from '@/core/use-cases/admin/GetRevenusReport.usecase';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const paiementRepository = new SupabasePaiementRepository();
const getRevenusReportUseCase = new GetRevenusReportUseCase(paiementRepository);

/**
 * @swagger
 * /api/admin/reports/revenus:
 *   get:
 *     summary: Rapport financier détaillé
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
      const report = await getRevenusReportUseCase.execute();

      return NextResponse.json(
        ApiResponse.success(report, 'Rapport récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
