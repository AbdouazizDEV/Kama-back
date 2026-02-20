import { NextRequest, NextResponse } from 'next/server';
import { SearchPublicAnnoncesUseCase } from '@/core/use-cases/public/SearchPublicAnnonces.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { searchAnnoncesSchema } from '@/presentation/validators/public.validator';

const annonceRepository = new SupabaseAnnonceRepository();
const searchPublicAnnoncesUseCase = new SearchPublicAnnoncesUseCase(annonceRepository);

/**
 * @swagger
 * /api/public/annonces/search:
 *   get:
 *     summary: Rechercher des annonces avec filtres basiques
 *     tags: [Public]
 *     security: []
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
 *         name: nombrePiecesMin
 *         schema:
 *           type: integer
 *       - in: query
 *         name: superficieMin
 *         schema:
 *           type: number
 *       - in: query
 *         name: estMeuble
 *         schema:
 *           type: boolean
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dateCreation, prix, nombreVues]
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Résultats de la recherche
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {
      typeBien: searchParams.get('typeBien'),
      ville: searchParams.get('ville'),
      quartier: searchParams.get('quartier'),
      prixMin: searchParams.get('prixMin'),
      prixMax: searchParams.get('prixMax'),
      nombrePiecesMin: searchParams.get('nombrePiecesMin'),
      superficieMin: searchParams.get('superficieMin'),
      estMeuble: searchParams.get('estMeuble'),
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    };

    const validated = validateQuery(query, searchAnnoncesSchema);
    const result = await searchPublicAnnoncesUseCase.execute(validated);

    return NextResponse.json(
      ApiResponse.success(result, 'Recherche effectuée avec succès'),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
