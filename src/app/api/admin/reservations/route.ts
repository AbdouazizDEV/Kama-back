import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { ListReservationsAdminUseCase } from '@/core/use-cases/admin/ListReservationsAdmin.usecase';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { listReservationsAdminSchema } from '@/presentation/validators/admin.validator';

const reservationRepository = new SupabaseReservationRepository();
const listReservationsAdminUseCase = new ListReservationsAdminUseCase(reservationRepository);

/**
 * @swagger
 * /api/admin/reservations:
 *   get:
 *     summary: Lister toutes les réservations
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
 *           enum: [EN_ATTENTE, ACCEPTEE, REJETEE, ANNULEE, TERMINEE]
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
 *         description: Liste des réservations récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, listReservationsAdminSchema);

      const result = await listReservationsAdminUseCase.execute(validated);

      return NextResponse.json(
        ApiResponse.success(result, 'Liste des réservations récupérée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
