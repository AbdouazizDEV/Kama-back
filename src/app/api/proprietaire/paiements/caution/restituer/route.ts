import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { RestituerCautionProprietaireUseCase } from '@/core/use-cases/proprietaire/RestituerCaution.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { restituerCautionSchema } from '@/presentation/validators/proprietaire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const paiementRepository = new SupabasePaiementRepository();
const reservationRepository = new SupabaseReservationRepository();
const restituerCautionUseCase = new RestituerCautionProprietaireUseCase(
  paiementRepository,
  userRepository,
  reservationRepository
);

/**
 * @swagger
 * /api/proprietaire/paiements/caution/restituer:
 *   post:
 *     summary: Restituer une caution à un locataire
 *     tags: [Propriétaire]
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
 *               referenceTransaction:
 *                 type: string
 *     responses:
 *       200:
 *         description: Caution restituée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const validated = await validateRequest(req, restituerCautionSchema);

      const remboursement = await restituerCautionUseCase.execute({
        reservationId: validated.reservationId,
        proprietaireId: req.user.id,
        referenceTransaction: validated.referenceTransaction,
      });

      return NextResponse.json(
        ApiResponse.success(
          { id: remboursement.id },
          'Caution restituée avec succès'
        ),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
