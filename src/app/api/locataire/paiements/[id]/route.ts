import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetPaiementUseCase } from '@/core/use-cases/locataire/GetPaiement.usecase';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const paiementRepository = new SupabasePaiementRepository();
const getPaiementUseCase = new GetPaiementUseCase(paiementRepository);

/**
 * @swagger
 * /api/locataire/paiements/{id}:
 *   get:
 *     summary: Consulter le détail d'un paiement
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
 *         description: ID du paiement
 *     responses:
 *       200:
 *         description: Détails du paiement récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Paiement non trouvé
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
      const paiement = await getPaiementUseCase.execute(id, req.user.id);

      return NextResponse.json(
        ApiResponse.success(paiement, 'Détails du paiement récupérés avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
