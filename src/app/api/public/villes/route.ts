import { NextResponse } from 'next/server';
import { GetVillesUseCase } from '@/core/use-cases/public/GetVilles.usecase';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const getVillesUseCase = new GetVillesUseCase();

/**
 * @swagger
 * /api/public/villes:
 *   get:
 *     summary: Lister toutes les villes disponibles
 *     tags: [Public]
 *     security: []
 *     responses:
 *       200:
 *         description: Liste des villes avec nombre d'annonces
 *       500:
 *         description: Erreur serveur
 */
export async function GET() {
  try {
    const villes = await getVillesUseCase.execute();

    return NextResponse.json(
      ApiResponse.success(villes, 'Villes récupérées avec succès'),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
