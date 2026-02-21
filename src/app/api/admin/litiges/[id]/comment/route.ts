import { NextRequest, NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/presentation/middlewares/admin.middleware';
import { CommentLitigeUseCase } from '@/core/use-cases/admin/CommentLitige.usecase';
import { SupabaseLitigeRepository } from '@/infrastructure/database/repositories/SupabaseLitigeRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { commentLitigeSchema } from '@/presentation/validators/admin.validator';

const litigeRepository = new SupabaseLitigeRepository();
const commentLitigeUseCase = new CommentLitigeUseCase(litigeRepository);

/**
 * @swagger
 * /api/admin/litiges/{id}/comment:
 *   post:
 *     summary: Ajouter un commentaire à un litige
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
 *               - commentaire
 *             properties:
 *               commentaire:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Commentaire ajouté avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Litige non trouvé
 *       501:
 *         description: Fonctionnalité non encore implémentée (modèle Litige à créer)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      if (!req.user) {
        throw new Error('Utilisateur non authentifié');
      }

      const validated = await validateRequest(req, commentLitigeSchema);

      await commentLitigeUseCase.execute({
        litigeId: params.id,
        auteurId: req.user.id,
        commentaire: validated.commentaire,
      });

      return NextResponse.json(
        ApiResponse.success(null, 'Commentaire ajouté avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
