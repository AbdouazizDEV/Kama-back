import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetRecommandationsUseCase } from '@/core/use-cases/locataire/GetRecommandations.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { SupabaseFavoriRepository } from '@/infrastructure/database/repositories/SupabaseFavoriRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { z } from 'zod';

const annonceRepository = new SupabaseAnnonceRepository();
const favoriRepository = new SupabaseFavoriRepository();
const reservationRepository = new SupabaseReservationRepository();
const getRecommandationsUseCase = new GetRecommandationsUseCase(
  annonceRepository,
  favoriRepository,
  reservationRepository
);

const recommandationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).optional(),
});

/**
 * @swagger
 * /api/locataire/annonces/recommandations:
 *   get:
 *     summary: Obtenir des recommandations personnalisées
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *     responses:
 *       200:
 *         description: Recommandations récupérées avec succès
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
      const validated = validateQuery(query, recommandationsSchema);
      const recommandations = await getRecommandationsUseCase.execute(
        req.user.id,
        validated.limit || 10
      );

      return NextResponse.json(
        ApiResponse.success(recommandations, 'Recommandations récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
