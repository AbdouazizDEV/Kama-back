import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ResilierMutuelleUseCase } from '@/core/use-cases/etudiant/ResilierMutuelle.usecase';
import { SupabaseMutuelleRepository } from '@/infrastructure/database/repositories/SupabaseMutuelleRepository';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const mutuelleRepository = new SupabaseMutuelleRepository();
const userRepository = new SupabaseUserRepository();
const resilierMutuelleUseCase = new ResilierMutuelleUseCase(mutuelleRepository, userRepository);

/**
 * @swagger
 * /api/etudiant/mutuelle/resilier:
 *   post:
 *     summary: Résilier mon adhésion à la mutuelle
 *     tags: [Étudiant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Adhésion résiliée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Adhésion mutuelle non trouvée
 *       409:
 *         description: Adhésion déjà résiliée
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'ETUDIANT') {
        throw ApiError.forbidden('Accès réservé aux étudiants');
      }

      await resilierMutuelleUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Adhésion résiliée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
