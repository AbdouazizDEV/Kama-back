import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { CancelReservationAdminUseCase } from '@/core/use-cases/admin/CancelReservationAdmin.usecase';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { cancelReservationSchema } from '@/presentation/validators/admin.validator';

const reservationRepository = new SupabaseReservationRepository();
const cancelReservationAdminUseCase = new CancelReservationAdminUseCase(reservationRepository);

/**
 * @swagger
 * /api/admin/reservations/{id}/cancel:
 *   put:
 *     summary: Annuler une réservation (cas exceptionnel)
 *     tags: [Administrateur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motif
 *             properties:
 *               motif:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Réservation annulée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Réservation non trouvée
 *       409:
 *         description: La réservation ne peut pas être annulée
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async (req) => {
    try {
      const validated = await validateRequest(req, cancelReservationSchema);

      await cancelReservationAdminUseCase.execute({
        reservationId: params.id,
        motif: validated.motif,
      });

      return NextResponse.json(
        ApiResponse.success(null, 'Réservation annulée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
