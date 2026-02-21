import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { AccepterReservationProprietaireUseCase } from '@/core/use-cases/proprietaire/AccepterReservation.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const reservationRepository = new SupabaseReservationRepository();
const accepterReservationUseCase = new AccepterReservationProprietaireUseCase(
  reservationRepository,
  userRepository
);

/**
 * @swagger
 * /api/proprietaire/reservations/{id}/accepter:
 *   put:
 *     summary: Accepter une demande de réservation
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
 *     responses:
 *       200:
 *         description: Réservation acceptée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       409:
 *         description: Réservation non en attente
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

      await accepterReservationUseCase.execute(params.id, req.user.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Réservation acceptée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
