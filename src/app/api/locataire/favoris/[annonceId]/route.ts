import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { RemoveFavoriUseCase } from '@/core/use-cases/locataire/RemoveFavori.usecase';
import { SupabaseFavoriRepository } from '@/infrastructure/database/repositories/SupabaseFavoriRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const favoriRepository = new SupabaseFavoriRepository();
const removeFavoriUseCase = new RemoveFavoriUseCase(favoriRepository);

/**
 * @swagger
 * /api/locataire/favoris/{annonceId}:
 *   delete:
 *     summary: Retirer une annonce des favoris
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: annonceId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID de l'annonce à retirer des favoris
 *     responses:
 *       200:
 *         description: Annonce retirée des favoris avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Favori non trouvé
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { annonceId: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const { annonceId } = params;
      await removeFavoriUseCase.execute(req.user.id, annonceId);

      return NextResponse.json(
        ApiResponse.success(null, 'Annonce retirée des favoris avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
