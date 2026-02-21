import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetReservationDetailAdminUseCase } from '@/core/use-cases/admin/GetReservationDetailAdmin.usecase';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const reservationRepository = new SupabaseReservationRepository();
const getReservationDetailAdminUseCase = new GetReservationDetailAdminUseCase(reservationRepository);

/**
 * @swagger
 * /api/admin/reservations/{id}:
 *   get:
 *     summary: Consulter le détail d'une réservation
 *     tags: [Administrateur]
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
 *         description: Détail de la réservation récupéré avec succès
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
  return withAdmin(async () => {
    try {
      const reservation = await getReservationDetailAdminUseCase.execute(params.id);

      return NextResponse.json(
        ApiResponse.success(
          {
            id: reservation.id,
            annonceId: reservation.annonceId,
            locataireId: reservation.locataireId,
            proprietaireId: reservation.proprietaireId,
            dateDebut: reservation.dateDebut,
            dateFin: reservation.dateFin,
            nombrePersonnes: reservation.nombrePersonnes,
            prixTotal: reservation.prixTotal.getMontant(),
            caution: reservation.caution.getMontant(),
            message: reservation.message,
            statut: reservation.statut,
            dateCreation: reservation.dateCreation,
            dateModification: reservation.dateModification,
          },
          'Détail de la réservation récupéré avec succès'
        ),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
