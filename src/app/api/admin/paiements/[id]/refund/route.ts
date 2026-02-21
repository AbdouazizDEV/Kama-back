import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { RefundPaiementAdminUseCase } from '@/core/use-cases/admin/RefundPaiementAdmin.usecase';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { refundPaiementSchema } from '@/presentation/validators/admin.validator';

const paiementRepository = new SupabasePaiementRepository();
const refundPaiementAdminUseCase = new RefundPaiementAdminUseCase(paiementRepository);

/**
 * @swagger
 * /api/admin/paiements/{id}/refund:
 *   put:
 *     summary: Traiter un remboursement
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motif
 *             properties:
 *               motif:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *               montant:
 *                 type: number
 *                 description: Montant partiel à rembourser (optionnel)
 *     responses:
 *       200:
 *         description: Remboursement traité avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Paiement non trouvé
 *       409:
 *         description: Le paiement ne peut pas être remboursé
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async (req) => {
    try {
      const validated = await validateRequest(req, refundPaiementSchema);

      await refundPaiementAdminUseCase.execute({
        paiementId: params.id,
        motif: validated.motif,
        montant: validated.montant,
      });

      return NextResponse.json(
        ApiResponse.success(null, 'Remboursement traité avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
