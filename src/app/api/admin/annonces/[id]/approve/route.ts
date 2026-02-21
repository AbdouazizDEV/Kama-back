import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { ApproveAnnonceUseCase } from '@/core/use-cases/admin/ApproveAnnonce.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const annonceRepository = new SupabaseAnnonceRepository();
const approveAnnonceUseCase = new ApproveAnnonceUseCase(annonceRepository);

/**
 * @swagger
 * /api/admin/annonces/{id}/approve:
 *   put:
 *     summary: Approuver une annonce
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
 *         description: Annonce approuvée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Annonce non trouvée
 *       409:
 *         description: L'annonce est déjà approuvée
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async () => {
    try {
      await approveAnnonceUseCase.execute(params.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Annonce approuvée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
