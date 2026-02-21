import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ListPaiementsProprietaireUseCase } from '@/core/use-cases/proprietaire/ListPaiements.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const paiementRepository = new SupabasePaiementRepository();
const listPaiementsUseCase = new ListPaiementsProprietaireUseCase(
  paiementRepository,
  userRepository
);

/**
 * @swagger
 * /api/proprietaire/paiements:
 *   get:
 *     summary: Consulter l'historique des paiements reçus
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Historique des paiements récupéré avec succès
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

      const paiements = await listPaiementsUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(paiements, 'Paiements récupérés avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
