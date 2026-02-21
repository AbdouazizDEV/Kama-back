import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetStatistiquesAnnonceProprietaireUseCase } from '@/core/use-cases/proprietaire/GetStatistiquesAnnonce.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const reservationRepository = new SupabaseReservationRepository();
const getStatistiquesUseCase = new GetStatistiquesAnnonceProprietaireUseCase(
  annonceRepository,
  userRepository,
  reservationRepository
);

/**
 * @swagger
 * /api/proprietaire/annonces/{id}/statistiques:
 *   get:
 *     summary: Consulter les stats d'une annonce
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
 *                     annonce:
 *                       type: object
 *                     reservations:
 *                       type: object
 *                     revenus:
 *                       type: object
 *                     occupation:
 *                       type: object
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const statistiques = await getStatistiquesUseCase.execute(params.id, req.user.id);

      return NextResponse.json(
        ApiResponse.success(statistiques, 'Statistiques récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
