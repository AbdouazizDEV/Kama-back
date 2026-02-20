import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetAnnonceDetailUseCase } from '@/core/use-cases/locataire/GetAnnonceDetail.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const annonceRepository = new SupabaseAnnonceRepository();
const getAnnonceDetailUseCase = new GetAnnonceDetailUseCase(annonceRepository);

/**
 * @swagger
 * /api/locataire/annonces/{id}:
 *   get:
 *     summary: Consulter le détail d'une annonce
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
 *         description: ID de l'annonce
 *     responses:
 *       200:
 *         description: Détails de l'annonce récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Annonce non trouvée
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
      const annonce = await getAnnonceDetailUseCase.execute(id);

      return NextResponse.json(
        ApiResponse.success(annonce, 'Détails de l\'annonce récupérés avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
