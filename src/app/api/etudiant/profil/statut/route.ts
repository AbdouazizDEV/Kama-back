import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetStatutVerificationUseCase } from '@/core/use-cases/etudiant/GetStatutVerification.usecase';
import { SupabaseEtudiantRepository } from '@/infrastructure/database/repositories/SupabaseEtudiantRepository';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const etudiantRepository = new SupabaseEtudiantRepository();
const userRepository = new SupabaseUserRepository();
const getStatutUseCase = new GetStatutVerificationUseCase(etudiantRepository, userRepository);

/**
 * @swagger
 * /api/etudiant/profil/statut:
 *   get:
 *     summary: Vérifier le statut de validation étudiant
 *     tags: [Étudiant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statut de validation récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     statutVerification:
 *                       type: string
 *                       enum: [EN_ATTENTE, VALIDE, REJETE]
 *                     hasDocuments:
 *                       type: boolean
 *                     universite:
 *                       type: string
 *                       nullable: true
 *                     filiere:
 *                       type: string
 *                       nullable: true
 *                     niveauEtude:
 *                       type: string
 *                       nullable: true
 *                     dateVerification:
 *                       type: string
 *                       format: date-time
 *                       nullable: true
 *                     motifRejet:
 *                       type: string
 *                       nullable: true
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'ETUDIANT') {
        throw ApiError.forbidden('Accès réservé aux étudiants');
      }

      const statut = await getStatutUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(statut, 'Statut de validation récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
