import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { RefuserReservationProprietaireUseCase } from '@/core/use-cases/proprietaire/RefuserReservation.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { refuserReservationSchema } from '@/presentation/validators/proprietaire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const reservationRepository = new SupabaseReservationRepository();
const refuserReservationUseCase = new RefuserReservationProprietaireUseCase(
  reservationRepository,
  userRepository
);

/**
 * @swagger
 * /api/proprietaire/reservations/{id}/refuser:
 *   put:
 *     summary: Refuser une demande de réservation
 *     tags: [Propriétaire]
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
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motif:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Réservation refusée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const validated = await validateRequest(req, refuserReservationSchema);

      await refuserReservationUseCase.execute({
        reservationId: params.id,
        proprietaireId: req.user.id,
        motif: validated.motif,
      });

      return NextResponse.json(
        ApiResponse.success(null, 'Réservation refusée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
