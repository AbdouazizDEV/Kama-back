import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { PostulerColocationUseCase } from '@/core/use-cases/etudiant/PostulerColocation.usecase';
import { SupabaseColocationRepository } from '@/infrastructure/database/repositories/SupabaseColocationRepository';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { postulerColocationSchema } from '@/presentation/validators/etudiant.validator';
import { ApiError } from '@/shared/utils/ApiError';

const colocationRepository = new SupabaseColocationRepository();
const userRepository = new SupabaseUserRepository();
const postulerColocationUseCase = new PostulerColocationUseCase(
  colocationRepository,
  userRepository
);

/**
 * @swagger
 * /api/etudiant/colocataires/candidature:
 *   post:
 *     summary: Postuler pour rejoindre une colocation
 *     tags: [Étudiant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - colocationId
 *             properties:
 *               colocationId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la colocation
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Message de candidature (optionnel)
 *     responses:
 *       201:
 *         description: Candidature créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Colocation non trouvée
 *       409:
 *         description: Candidature déjà existante ou colocation complète
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'ETUDIANT') {
        throw ApiError.forbidden('Accès réservé aux étudiants');
      }

      const validated = await validateRequest(req, postulerColocationSchema);
      const candidature = await postulerColocationUseCase.execute({
        userId: req.user.id,
        ...validated,
      });

      return NextResponse.json(
        ApiResponse.success(
          {
            id: candidature.id,
            colocationId: candidature.colocationId,
            statut: candidature.statut,
          },
          'Candidature créée avec succès'
        ),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
