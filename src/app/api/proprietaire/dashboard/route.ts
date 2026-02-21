import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetDashboardProprietaireUseCase } from '@/core/use-cases/proprietaire/GetDashboard.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const reservationRepository = new SupabaseReservationRepository();
const paiementRepository = new SupabasePaiementRepository();
const getDashboardUseCase = new GetDashboardProprietaireUseCase(
  userRepository,
  annonceRepository,
  reservationRepository,
  paiementRepository
);

/**
 * @swagger
 * /api/proprietaire/dashboard:
 *   get:
 *     summary: Obtenir les données du dashboard principal
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Données du dashboard récupérées avec succès
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

      const dashboard = await getDashboardUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(dashboard, 'Dashboard récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
