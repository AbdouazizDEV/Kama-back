import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { UpdateAvisUseCase } from '@/core/use-cases/locataire/UpdateAvis.usecase';
import { DeleteAvisUseCase } from '@/core/use-cases/locataire/DeleteAvis.usecase';
import { SupabaseAvisRepository } from '@/infrastructure/database/repositories/SupabaseAvisRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { updateAvisSchema } from '@/presentation/validators/locataire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const avisRepository = new SupabaseAvisRepository();
const updateAvisUseCase = new UpdateAvisUseCase(avisRepository);
const deleteAvisUseCase = new DeleteAvisUseCase(avisRepository);

/**
 * @swagger
 * /api/locataire/avis/{id}:
 *   put:
 *     summary: Modifier un avis existant
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
 *         description: ID de l'avis
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               note:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               commentaire:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *     responses:
 *       200:
 *         description: Avis modifié avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Avis non trouvé
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const { id } = params;
      const validated = await validateRequest(req, updateAvisSchema);
      const avis = await updateAvisUseCase.execute(id, req.user.id, validated);

      return NextResponse.json(
        ApiResponse.success(
          {
            id: avis.id,
            note: avis.note,
            commentaire: avis.commentaire,
            dateModification: avis.dateModification,
          },
          'Avis modifié avec succès'
        ),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * @swagger
 * /api/locataire/avis/{id}:
 *   delete:
 *     summary: Supprimer un avis
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
 *         description: ID de l'avis
 *     responses:
 *       200:
 *         description: Avis supprimé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Avis non trouvé
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const { id } = params;
      await deleteAvisUseCase.execute(id, req.user.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Avis supprimé avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
