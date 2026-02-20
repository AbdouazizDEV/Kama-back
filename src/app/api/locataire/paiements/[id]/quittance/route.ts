import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetPaiementUseCase } from '@/core/use-cases/locataire/GetPaiement.usecase';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { handleError } from '@/presentation/middlewares/error.middleware';

const paiementRepository = new SupabasePaiementRepository();
const getPaiementUseCase = new GetPaiementUseCase(paiementRepository);

/**
 * @swagger
 * /api/locataire/paiements/{id}/quittance:
 *   get:
 *     summary: Télécharger une quittance (PDF)
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

      // TODO: Implémenter la génération PDF de la quittance
      // Pour l'instant, retourner un JSON formaté
      const quittanceContent = JSON.stringify(paiement, null, 2);

      return new NextResponse(quittanceContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="quittance-${id}.json"`,
        },
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
