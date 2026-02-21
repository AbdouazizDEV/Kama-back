import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetCotisationsUseCase } from '@/core/use-cases/etudiant/GetCotisations.usecase';
import { SupabaseMutuelleRepository } from '@/infrastructure/database/repositories/SupabaseMutuelleRepository';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const mutuelleRepository = new SupabaseMutuelleRepository();
const userRepository = new SupabaseUserRepository();
const getCotisationsUseCase = new GetCotisationsUseCase(mutuelleRepository, userRepository);

/**
 * @swagger
 * /api/etudiant/mutuelle/cotisations:
 *   get:
 *     summary: Consulter l'historique de mes cotisations
 *     tags: [Étudiant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des cotisations récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Aucune adhésion mutuelle trouvée
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'ETUDIANT') {
        throw ApiError.forbidden('Accès réservé aux étudiants');
      }

      const cotisations = await getCotisationsUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(cotisations, 'Historique des cotisations récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
