import { NextResponse } from 'next/server';
import { GetStatistiquesUseCase } from '@/core/use-cases/public/GetStatistiques.usecase';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const getStatistiquesUseCase = new GetStatistiquesUseCase();

/**
 * @swagger
 * /api/public/statistiques:
 *   get:
 *     summary: Statistiques publiques de la plateforme
 *     tags: [Public]
 *     security: []
 *     responses:
 *       200:
 *         description: Statistiques de la plateforme
 *       500:
 *         description: Erreur serveur
 */
export async function GET() {
  try {
    const statistiques = await getStatistiquesUseCase.execute();

    return NextResponse.json(
      ApiResponse.success(statistiques, 'Statistiques récupérées avec succès'),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
