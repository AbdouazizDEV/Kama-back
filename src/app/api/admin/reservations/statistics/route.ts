import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetReservationsStatisticsUseCase } from '@/core/use-cases/admin/GetReservationsStatistics.usecase';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const reservationRepository = new SupabaseReservationRepository();
const getReservationsStatisticsUseCase = new GetReservationsStatisticsUseCase(reservationRepository);

/**
 * @swagger
 * /api/admin/reservations/statistics:
 *   get:
 *     summary: Statistiques des réservations
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
      const statistics = await getReservationsStatisticsUseCase.execute();

      return NextResponse.json(
        ApiResponse.success(statistics, 'Statistiques récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
