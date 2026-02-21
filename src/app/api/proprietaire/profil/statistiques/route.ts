import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetStatistiquesProfilProprietaireUseCase } from '@/core/use-cases/proprietaire/GetStatistiquesProfil.usecase';
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
const getStatistiquesUseCase = new GetStatistiquesProfilProprietaireUseCase(
  userRepository,
  annonceRepository,
  reservationRepository,
  paiementRepository
);

/**
 * @swagger
 * /api/proprietaire/profil/statistiques:
 *   get:
 *     summary: Consulter mes statistiques globales
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     annonces:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         approuvees:
 *                           type: integer
 *                         disponibles:
 *                           type: integer
 *                         enAttente:
 *                           type: integer
 *                         totalVues:
 *                           type: integer
 *                     reservations:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         acceptees:
 *                           type: integer
 *                         terminees:
 *                           type: integer
 *                         enAttente:
 *                           type: integer
 *                     paiements:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         valides:
 *                           type: integer
 *                         revenusTotal:
 *                           type: number
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

      const statistiques = await getStatistiquesUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(statistiques, 'Statistiques récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
