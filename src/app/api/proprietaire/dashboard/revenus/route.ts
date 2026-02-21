import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetDashboardRevenusProprietaireUseCase } from '@/core/use-cases/proprietaire/GetDashboardRevenus.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { dashboardRevenusSchema } from '@/presentation/validators/proprietaire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const paiementRepository = new SupabasePaiementRepository();
const getDashboardRevenusUseCase = new GetDashboardRevenusProprietaireUseCase(
  userRepository,
  paiementRepository
);

/**
 * @swagger
 * /api/proprietaire/dashboard/revenus:
 *   get:
 *     summary: Statistiques de revenus (graphiques)
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: periode
 *         schema:
 *           type: string
 *           enum: [mois, annee]
 *           default: mois
 *     responses:
 *       200:
 *         description: Statistiques de revenus récupérées avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, dashboardRevenusSchema);

      const revenus = await getDashboardRevenusUseCase.execute(
        req.user.id,
        validated.periode || 'mois'
      );

      return NextResponse.json(
        ApiResponse.success(revenus, 'Statistiques de revenus récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
