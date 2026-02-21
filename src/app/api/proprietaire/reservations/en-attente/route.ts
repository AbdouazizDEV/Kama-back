import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ListReservationsEnAttenteProprietaireUseCase } from '@/core/use-cases/proprietaire/ListReservationsEnAttente.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const reservationRepository = new SupabaseReservationRepository();
const listReservationsEnAttenteUseCase = new ListReservationsEnAttenteProprietaireUseCase(
  reservationRepository,
  userRepository,
  annonceRepository
);

/**
 * @swagger
 * /api/proprietaire/reservations/en-attente:
 *   get:
 *     summary: Lister les demandes en attente
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réservations en attente récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const reservations = await listReservationsEnAttenteUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(reservations, 'Réservations en attente récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
