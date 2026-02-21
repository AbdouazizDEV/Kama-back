import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { ResolveLitigeUseCase } from '@/core/use-cases/admin/ResolveLitige.usecase';
import { SupabaseLitigeRepository } from '@/infrastructure/database/repositories/SupabaseLitigeRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { resolveLitigeSchema } from '@/presentation/validators/admin.validator';

const litigeRepository = new SupabaseLitigeRepository();
const resolveLitigeUseCase = new ResolveLitigeUseCase(litigeRepository);

/**
 * @swagger
 * /api/admin/litiges/{id}/resolve:
 *   put:
 *     summary: Résoudre un litige
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
 *               - resolution
 *               - statut
 *             properties:
 *               resolution:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *               statut:
 *                 type: string
 *                 enum: [RESOLU, FERME]
 *     responses:
 *       200:
 *         description: Litige résolu avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Litige non trouvé
 *       501:
 *         description: Fonctionnalité non encore implémentée (modèle Litige à créer)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async (req) => {
    try {
      const validated = await validateRequest(req, resolveLitigeSchema);

      await resolveLitigeUseCase.execute({
        litigeId: params.id,
        resolution: validated.resolution,
        statut: validated.statut,
      });

      return NextResponse.json(
        ApiResponse.success(null, 'Litige résolu avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
