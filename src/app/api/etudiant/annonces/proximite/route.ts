import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { SearchAnnoncesProximiteUseCase } from '@/core/use-cases/etudiant/SearchAnnoncesProximite.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { SupabaseEtudiantRepository } from '@/infrastructure/database/repositories/SupabaseEtudiantRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { searchAnnoncesProximiteSchema } from '@/presentation/validators/etudiant.validator';
import { ApiError } from '@/shared/utils/ApiError';

const annonceRepository = new SupabaseAnnonceRepository();
const etudiantRepository = new SupabaseEtudiantRepository();
const searchProximiteUseCase = new SearchAnnoncesProximiteUseCase(
  annonceRepository,
  etudiantRepository
);

/**
 * @swagger
 * /api/etudiant/annonces/proximite:
 *   get:
 *     summary: Trouver logements proches de mon université
 *     tags: [Étudiant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Annonces proches récupérées avec succès
 *       400:
 *         description: Université non renseignée
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
      const criteria = validateQuery(searchParams, searchAnnoncesProximiteSchema);
      const result = await searchProximiteUseCase.execute(req.user.id, criteria);

      return NextResponse.json(
        ApiResponse.success(result, 'Annonces proches récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
