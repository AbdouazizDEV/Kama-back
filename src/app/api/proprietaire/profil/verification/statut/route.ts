import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetStatutVerificationProprietaireUseCase } from '@/core/use-cases/proprietaire/GetStatutVerification.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const getStatutVerificationUseCase = new GetStatutVerificationProprietaireUseCase(userRepository);

/**
 * @swagger
 * /api/proprietaire/profil/verification/statut:
 *   get:
 *     summary: Consulter le statut de ma vérification
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut de vérification récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     estVerifie:
 *                       type: boolean
 *                     estActif:
 *                       type: boolean
 *                     dateVerification:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     documentsUploades:
 *                       type: object
 *                       properties:
 *                         pieceIdentite:
 *                           type: boolean
 *                         justificatifDomicile:
 *                           type: boolean
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

      const statut = await getStatutVerificationUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(statut, 'Statut de vérification récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
