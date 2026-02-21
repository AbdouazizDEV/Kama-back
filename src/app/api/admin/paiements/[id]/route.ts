import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetPaiementDetailAdminUseCase } from '@/core/use-cases/admin/GetPaiementDetailAdmin.usecase';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const paiementRepository = new SupabasePaiementRepository();
const getPaiementDetailAdminUseCase = new GetPaiementDetailAdminUseCase(paiementRepository);

/**
 * @swagger
 * /api/admin/paiements/{id}:
 *   get:
 *     summary: Consulter le détail d'une transaction
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
 *         description: Détail du paiement récupéré avec succès
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
  return withAdmin(async () => {
    try {
      const paiement = await getPaiementDetailAdminUseCase.execute(params.id);

      return NextResponse.json(
        ApiResponse.success(
          {
            id: paiement.id,
            reservationId: paiement.reservationId,
            locataireId: paiement.locataireId,
            proprietaireId: paiement.proprietaireId,
            montant: paiement.montant.getMontant(),
            methodePaiement: paiement.methodePaiement,
            statut: paiement.statut,
            referenceTransaction: paiement.referenceTransaction,
            dateCreation: paiement.dateCreation,
            dateModification: paiement.dateModification,
            dateValidation: paiement.dateValidation,
            motifEchec: paiement.motifEchec,
          },
          'Détail du paiement récupéré avec succès'
        ),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
