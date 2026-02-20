import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetReservationUseCase } from '@/core/use-cases/locataire/GetReservation.usecase';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { handleError } from '@/presentation/middlewares/error.middleware';

const reservationRepository = new SupabaseReservationRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const getReservationUseCase = new GetReservationUseCase(
  reservationRepository,
  annonceRepository
);

/**
 * @swagger
 * /api/locataire/reservations/{id}/contrat:
 *   get:
 *     summary: Télécharger le contrat de location (PDF)
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
 *         description: PDF généré avec succès
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Réservation non trouvée
 */
export async function GET(
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

      // TODO: Implémenter la génération PDF du contrat
      // Pour l'instant, retourner un JSON formaté
      const contratContent = JSON.stringify(reservation, null, 2);

      return new NextResponse(contratContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="contrat-${id}.json"`,
        },
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
