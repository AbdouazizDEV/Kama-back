import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { RejectAnnonceUseCase } from '@/core/use-cases/admin/RejectAnnonce.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { rejectAnnonceSchema } from '@/presentation/validators/admin.validator';

const annonceRepository = new SupabaseAnnonceRepository();
const rejectAnnonceUseCase = new RejectAnnonceUseCase(annonceRepository);

/**
 * @swagger
 * /api/admin/annonces/{id}/reject:
 *   put:
 *     summary: Rejeter une annonce avec motif
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
 *     responses:
 *       200:
 *         description: Annonce rejetée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Annonce non trouvée
 *       409:
 *         description: L'annonce est déjà rejetée
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async (req) => {
    try {
      const validated = await validateRequest(req, rejectAnnonceSchema);

      await rejectAnnonceUseCase.execute({
        annonceId: params.id,
        motif: validated.motif,
      });

      return NextResponse.json(
        ApiResponse.success(null, 'Annonce rejetée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
