import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { DemanderRemboursementCautionUseCase } from '@/core/use-cases/locataire/DemanderRemboursementCaution.usecase';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { z } from 'zod';

const paiementRepository = new SupabasePaiementRepository();
const reservationRepository = new SupabaseReservationRepository();
const demanderRemboursementCautionUseCase = new DemanderRemboursementCautionUseCase(
  paiementRepository,
  reservationRepository
);

const remboursementCautionSchema = z.object({
  reservationId: z.string().uuid('ID de réservation invalide'),
});

/**
 * @swagger
 * /api/locataire/paiements/caution/remboursement:
 *   post:
 *     summary: Demander le remboursement de caution
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reservationId
 *             properties:
 *               reservationId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Demande de remboursement créée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Réservation ou paiement non trouvé
 *       409:
 *         description: Réservation non terminée
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const validated = await validateRequest(req, remboursementCautionSchema);
      const demande = await demanderRemboursementCautionUseCase.execute(
        validated.reservationId,
        req.user.id
      );

      return NextResponse.json(
        ApiResponse.success(demande, 'Demande de remboursement créée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
