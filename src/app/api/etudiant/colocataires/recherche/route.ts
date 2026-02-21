import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { SearchColocatairesUseCase } from '@/core/use-cases/etudiant/SearchColocataires.usecase';
import { SupabaseColocationRepository } from '@/infrastructure/database/repositories/SupabaseColocationRepository';
import { SupabaseEtudiantRepository } from '@/infrastructure/database/repositories/SupabaseEtudiantRepository';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { searchColocatairesSchema } from '@/presentation/validators/etudiant.validator';
import { ApiError } from '@/shared/utils/ApiError';

const colocationRepository = new SupabaseColocationRepository();
const etudiantRepository = new SupabaseEtudiantRepository();
const userRepository = new SupabaseUserRepository();
const searchColocatairesUseCase = new SearchColocatairesUseCase(
  colocationRepository,
  etudiantRepository,
  userRepository
);

/**
 * @swagger
 * /api/etudiant/colocataires/recherche:
 *   get:
 *     summary: Rechercher des colocataires compatibles
 *     tags: [Étudiant]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: universite
 *         schema:
 *           type: string
 *         description: Filtrer par université
 *       - in: query
 *         name: filiere
 *         schema:
 *           type: string
 *         description: Filtrer par filière
 *       - in: query
 *         name: niveauEtude
 *         schema:
 *           type: string
 *           enum: [L1, L2, L3, M1, M2, Doctorat]
 *         description: Filtrer par niveau d'étude
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
 *         description: Colocataires compatibles récupérés avec succès
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
      const criteria = validateQuery(searchParams, searchColocatairesSchema);
      const result = await searchColocatairesUseCase.execute(req.user.id, criteria);

      return NextResponse.json(
        ApiResponse.success(result, 'Colocataires compatibles récupérés avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
