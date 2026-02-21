import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { SearchColocationsUseCase } from '@/core/use-cases/etudiant/SearchColocations.usecase';
import { SupabaseColocationRepository } from '@/infrastructure/database/repositories/SupabaseColocationRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { searchColocationsSchema } from '@/presentation/validators/etudiant.validator';
import { ApiError } from '@/shared/utils/ApiError';

const colocationRepository = new SupabaseColocationRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const searchColocationsUseCase = new SearchColocationsUseCase(
  colocationRepository,
  annonceRepository
);

/**
 * @swagger
 * /api/etudiant/annonces/colocation:
 *   get:
 *     summary: Rechercher des colocations disponibles
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
 *         name: nombrePlacesMin
 *         schema:
 *           type: integer
 *         description: Nombre minimum de places
 *       - in: query
 *         name: placesDisponibles
 *         schema:
 *           type: boolean
 *         description: Uniquement les colocations avec places disponibles
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
 *         description: Colocations récupérées avec succès
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
      const criteria = validateQuery(searchParams, searchColocationsSchema);
      const result = await searchColocationsUseCase.execute(criteria);

      return NextResponse.json(
        ApiResponse.success(result, 'Colocations récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
