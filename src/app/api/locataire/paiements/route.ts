import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ListPaiementsUseCase } from '@/core/use-cases/locataire/ListPaiements.usecase';
import { CreatePaiementUseCase } from '@/core/use-cases/locataire/CreatePaiement.usecase';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { createPaiementSchema } from '@/presentation/validators/locataire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const paiementRepository = new SupabasePaiementRepository();
const reservationRepository = new SupabaseReservationRepository();
const listPaiementsUseCase = new ListPaiementsUseCase(paiementRepository);
const createPaiementUseCase = new CreatePaiementUseCase(
  paiementRepository,
  reservationRepository
);

/**
 * @swagger
 * /api/locataire/paiements:
 *   get:
 *     summary: Consulter l'historique de mes paiements
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des paiements récupéré avec succès
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

      const paiements = await listPaiementsUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(paiements, 'Historique des paiements récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * @swagger
 * /api/locataire/paiements:
 *   post:
 *     summary: Initier un nouveau paiement
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
 *               - methodePaiement
 *               - montant
 *             properties:
 *               reservationId:
 *                 type: string
 *                 format: uuid
 *               methodePaiement:
 *                 type: string
 *                 enum: [AIRTEL_MONEY, MOOV_MONEY, STRIPE, ESPECE]
 *               montant:
 *                 type: number
 *                 minimum: 0
 *               referenceTransaction:
 *                 type: string
 *     responses:
 *       201:
 *         description: Paiement créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Réservation non trouvée
 *       409:
 *         description: Réservation non acceptée
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const validated = await validateRequest(req, createPaiementSchema);
      const paiement = await createPaiementUseCase.execute({
        reservationId: validated.reservationId,
        locataireId: req.user.id,
        methodePaiement: validated.methodePaiement,
        montant: validated.montant,
        referenceTransaction: validated.referenceTransaction,
      });

      return NextResponse.json(
        ApiResponse.success(
          {
            id: paiement.id,
            reservationId: paiement.reservationId,
            montant: paiement.montant.getMontant(),
            statut: paiement.statut,
          },
          'Paiement créé avec succès'
        ),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
