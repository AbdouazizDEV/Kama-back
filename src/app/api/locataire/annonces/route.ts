import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { SearchAnnoncesUseCase } from '@/core/use-cases/locataire/SearchAnnonces.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { searchAnnoncesLocataireSchema } from '@/presentation/validators/locataire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const annonceRepository = new SupabaseAnnonceRepository();
const searchAnnoncesUseCase = new SearchAnnoncesUseCase(annonceRepository);

/**
 * @swagger
 * /api/locataire/annonces:
 *   get:
 *     summary: Rechercher des annonces avec filtres avancés
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: typeBien
 *         schema:
 *           type: string
 *           enum: [APPARTEMENT, MAISON, TERRAIN, VEHICULE]
 *       - in: query
 *         name: ville
 *         schema:
 *           type: string
 *       - in: query
 *         name: quartier
 *         schema:
 *           type: string
 *       - in: query
 *         name: prixMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: prixMax
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Résultats de recherche récupérés avec succès
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

      const query = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(query, searchAnnoncesLocataireSchema);
      const result = await searchAnnoncesUseCase.execute(validated);

      return NextResponse.json(
        ApiResponse.success(result, 'Résultats de recherche récupérés avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
