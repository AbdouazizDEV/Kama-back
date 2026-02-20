import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { AnnulerReservationUseCase } from '@/core/use-cases/locataire/AnnulerReservation.usecase';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { annulerReservationSchema } from '@/presentation/validators/locataire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const reservationRepository = new SupabaseReservationRepository();
const annulerReservationUseCase = new AnnulerReservationUseCase(reservationRepository);

/**
 * @swagger
 * /api/locataire/reservations/{id}/annuler:
 *   put:
 *     summary: Annuler une réservation
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de la réservation
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motif:
 *                 type: string
 *                 minLength: 5
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
 *         description: Réservation déjà annulée ou terminée
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const { id } = params;
      const validated = await validateRequest(req, annulerReservationSchema);
      const reservation = await annulerReservationUseCase.execute(
        id,
        req.user.id,
        validated.motif
      );

      return NextResponse.json(
        ApiResponse.success(
          {
            id: reservation.id,
            statut: reservation.statut,
          },
          'Réservation annulée avec succès'
        ),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
