import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const reservationRepository = new SupabaseReservationRepository();

/**
 * @swagger
 * /api/locataire/profil/score:
 *   get:
 *     summary: Consulter mon score de confiance
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Score de confiance récupéré avec succès
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
 *                     score:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 100
 *                     details:
 *                       type: object
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

      // Récupérer les réservations du locataire
      const reservations = await reservationRepository.findByLocataire(req.user.id);

      // Calculer le score basé sur les réservations terminées avec succès
      const reservationsTerminees = reservations.filter(
        (r) => r.statut === 'TERMINEE'
      ).length;
      const reservationsAcceptees = reservations.filter(
        (r) => r.statut === 'ACCEPTEE'
      ).length;

      // Score simple basé sur le nombre de réservations terminées
      const score = Math.min(100, reservationsTerminees * 10 + reservationsAcceptees * 5);

      return NextResponse.json(
        ApiResponse.success(
          {
            score,
            details: {
              reservationsTerminees,
              reservationsAcceptees,
              totalReservations: reservations.length,
            },
          },
          'Score de confiance récupéré avec succès'
        ),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
