import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { PayerCotisationUseCase } from '@/core/use-cases/etudiant/PayerCotisation.usecase';
import { SupabaseMutuelleRepository } from '@/infrastructure/database/repositories/SupabaseMutuelleRepository';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { payerCotisationSchema } from '@/presentation/validators/etudiant.validator';
import { ApiError } from '@/shared/utils/ApiError';

const mutuelleRepository = new SupabaseMutuelleRepository();
const userRepository = new SupabaseUserRepository();
const payerCotisationUseCase = new PayerCotisationUseCase(mutuelleRepository, userRepository);

/**
 * @swagger
 * /api/etudiant/mutuelle/payer:
 *   post:
 *     summary: Payer ma cotisation mensuelle
 *     tags: [Étudiant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - mois
 *               - annee
 *               - referenceTransaction
 *             properties:
 *               mois:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 12
 *                 example: 3
 *               annee:
 *                 type: integer
 *                 minimum: 2020
 *                 maximum: 2100
 *                 example: 2024
 *               referenceTransaction:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "TXN-123456789"
 *     responses:
 *       200:
 *         description: Cotisation payée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Adhésion mutuelle non trouvée
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'ETUDIANT') {
        throw ApiError.forbidden('Accès réservé aux étudiants');
      }

      const validated = await validateRequest(req, payerCotisationSchema);
      const cotisation = await payerCotisationUseCase.execute({
        userId: req.user.id,
        ...validated,
      });

      return NextResponse.json(
        ApiResponse.success(
          {
            id: cotisation.id,
            mois: cotisation.mois,
            annee: cotisation.annee,
            montant: cotisation.montant.getMontant(),
            statut: cotisation.statut,
          },
          'Cotisation payée avec succès'
        ),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
