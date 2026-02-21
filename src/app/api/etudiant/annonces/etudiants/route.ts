import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { SearchAnnoncesEtudiantsUseCase } from '@/core/use-cases/etudiant/SearchAnnoncesEtudiants.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { searchAnnoncesEtudiantsSchema } from '@/presentation/validators/etudiant.validator';
import { ApiError } from '@/shared/utils/ApiError';

const annonceRepository = new SupabaseAnnonceRepository();
const searchAnnoncesUseCase = new SearchAnnoncesEtudiantsUseCase(annonceRepository);

/**
 * @swagger
 * /api/etudiant/annonces/etudiants:
 *   get:
 *     summary: Rechercher annonces marquées "logement étudiant"
 *     tags: [Étudiant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: ville
 *         schema:
 *           type: string
 *         description: Filtrer par ville
 *       - in: query
 *         name: quartier
 *         schema:
 *           type: string
 *         description: Filtrer par quartier
 *       - in: query
 *         name: prixMin
 *         schema:
 *           type: number
 *         description: Prix minimum
 *       - in: query
 *         name: prixMax
 *         schema:
 *           type: number
 *         description: Prix maximum
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Nombre d'éléments par page
 *     responses:
 *       200:
 *         description: Annonces récupérées avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'ETUDIANT') {
      throw ApiError.forbidden('Accès réservé aux étudiants');
    }

      const searchParams = Object.fromEntries(request.nextUrl.searchParams);
      const criteria = validateQuery(searchParams, searchAnnoncesEtudiantsSchema);
      const result = await searchAnnoncesUseCase.execute(criteria);

      return NextResponse.json(
        ApiResponse.success(result, 'Annonces étudiants récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
