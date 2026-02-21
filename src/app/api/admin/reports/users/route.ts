import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetUsersReportUseCase } from '@/core/use-cases/admin/GetUsersReport.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const userRepository = new SupabaseUserRepository();
const getUsersReportUseCase = new GetUsersReportUseCase(userRepository);

/**
 * @swagger
 * /api/admin/reports/users:
 *   get:
 *     summary: Rapport détaillé des utilisateurs
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
      const report = await getUsersReportUseCase.execute();

      return NextResponse.json(
        ApiResponse.success(report, 'Rapport récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
