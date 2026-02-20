import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetReservationUseCase } from '@/core/use-cases/locataire/GetReservation.usecase';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const reservationRepository = new SupabaseReservationRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const getReservationUseCase = new GetReservationUseCase(
  reservationRepository,
  annonceRepository
);

/**
 * @swagger
 * /api/locataire/reservations/{id}/signer:
 *   post:
 *     summary: Signer électroniquement le contrat
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
 *     responses:
 *       200:
 *         description: Contrat signé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Réservation non trouvée
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const { id } = params;
      const reservation = await getReservationUseCase.execute(id, req.user.id);

      // TODO: Implémenter la signature électronique
      // Pour l'instant, simuler la signature
      return NextResponse.json(
        ApiResponse.success(
          {
            reservationId: id,
            signe: true,
            dateSignature: new Date().toISOString(),
          },
          'Contrat signé avec succès'
        ),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
