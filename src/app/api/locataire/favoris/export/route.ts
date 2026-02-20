import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ListFavorisUseCase } from '@/core/use-cases/locataire/ListFavoris.usecase';
import { SupabaseFavoriRepository } from '@/infrastructure/database/repositories/SupabaseFavoriRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { handleError } from '@/presentation/middlewares/error.middleware';

const favoriRepository = new SupabaseFavoriRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const listFavorisUseCase = new ListFavorisUseCase(favoriRepository, annonceRepository);

/**
 * @swagger
 * /api/locataire/favoris/export:
 *   get:
 *     summary: Exporter ma liste de favoris (PDF)
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
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
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const favoris = await listFavorisUseCase.execute(req.user.id);

      // TODO: Implémenter la génération PDF
      // Pour l'instant, retourner un JSON formaté
      const pdfContent = JSON.stringify(favoris, null, 2);

      return new NextResponse(pdfContent, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="mes-favoris.json"',
        },
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
