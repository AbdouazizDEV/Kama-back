import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ListReservationsUseCase } from '@/core/use-cases/locataire/ListReservations.usecase';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const reservationRepository = new SupabaseReservationRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const listReservationsUseCase = new ListReservationsUseCase(
  reservationRepository,
  annonceRepository
);

/**
 * @swagger
 * /api/locataire/profil/historique:
 *   get:
 *     summary: Consulter mon historique de locations
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const reservations = await listReservationsUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(reservations, 'Historique récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
