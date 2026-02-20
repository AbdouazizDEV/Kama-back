import { NextRequest, NextResponse } from 'next/server';
import { ListPublicAnnoncesUseCase } from '@/core/use-cases/public/ListPublicAnnonces.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { listPublicAnnoncesSchema } from '@/presentation/validators/public.validator';

const annonceRepository = new SupabaseAnnonceRepository();
const listPublicAnnoncesUseCase = new ListPublicAnnoncesUseCase(annonceRepository);

/**
 * @swagger
 * /api/public/annonces:
 *   get:
 *     summary: Lister toutes les annonces publiques
 *     tags: [Public]
 *     security: []
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
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dateCreation, prix, nombreVues]
 *           default: dateCreation
 *         description: Critère de tri
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Ordre de tri
 *     responses:
 *       200:
 *         description: Liste des annonces publiques
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      sortBy: searchParams.get('sortBy'),
      sortOrder: searchParams.get('sortOrder'),
    };

    const validated = validateQuery(query, listPublicAnnoncesSchema);
    const result = await listPublicAnnoncesUseCase.execute(validated);

    return NextResponse.json(
      ApiResponse.success(result, 'Annonces récupérées avec succès'),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
