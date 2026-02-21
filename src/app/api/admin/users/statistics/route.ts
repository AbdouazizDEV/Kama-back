import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetUserStatisticsUseCase } from '@/core/use-cases/admin/GetUserStatistics.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const userRepository = new SupabaseUserRepository();
const getUserStatisticsUseCase = new GetUserStatisticsUseCase(userRepository);

/**
 * @swagger
 * /api/admin/users/statistics:
 *   get:
 *     summary: Statistiques des utilisateurs (inscriptions, activité)
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
      const statistics = await getUserStatisticsUseCase.execute();

      return NextResponse.json(
        ApiResponse.success(statistics, 'Statistiques récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
