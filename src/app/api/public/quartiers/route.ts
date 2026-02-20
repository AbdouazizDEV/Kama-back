import { NextRequest, NextResponse } from 'next/server';
import { GetQuartiersUseCase } from '@/core/use-cases/public/GetQuartiers.usecase';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { getQuartiersSchema } from '@/presentation/validators/public.validator';

const getQuartiersUseCase = new GetQuartiersUseCase();

/**
 * @swagger
 * /api/public/quartiers:
 *   get:
 *     summary: Lister tous les quartiers (filtrable par ville)
 *     tags: [Public]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: ville
 *         schema:
 *           type: string
 *         description: Filtrer par ville
 *     responses:
 *       200:
 *         description: Liste des quartiers avec nombre d'annonces
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = {
      ville: searchParams.get('ville'),
    };

    const validated = validateQuery(query, getQuartiersSchema);
    const quartiers = await getQuartiersUseCase.execute(validated);

    return NextResponse.json(
      ApiResponse.success(quartiers, 'Quartiers récupérés avec succès'),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
