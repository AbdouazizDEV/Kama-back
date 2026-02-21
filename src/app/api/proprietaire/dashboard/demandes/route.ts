import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetDashboardDemandesProprietaireUseCase } from '@/core/use-cases/proprietaire/GetDashboardDemandes.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const reservationRepository = new SupabaseReservationRepository();
const getDashboardDemandesUseCase = new GetDashboardDemandesProprietaireUseCase(
  userRepository,
  reservationRepository,
  annonceRepository
);

/**
 * @swagger
 * /api/proprietaire/dashboard/demandes:
 *   get:
 *     summary: Résumé des demandes récentes
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Résumé des demandes récupéré avec succès
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

      const demandes = await getDashboardDemandesUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(demandes, 'Résumé des demandes récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
