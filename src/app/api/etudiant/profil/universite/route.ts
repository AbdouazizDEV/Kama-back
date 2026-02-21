import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { UpdateUniversiteUseCase } from '@/core/use-cases/etudiant/UpdateUniversite.usecase';
import { SupabaseEtudiantRepository } from '@/infrastructure/database/repositories/SupabaseEtudiantRepository';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { updateUniversiteSchema } from '@/presentation/validators/etudiant.validator';
import { ApiError } from '@/shared/utils/ApiError';

const etudiantRepository = new SupabaseEtudiantRepository();
const userRepository = new SupabaseUserRepository();
const updateUniversiteUseCase = new UpdateUniversiteUseCase(etudiantRepository, userRepository);

/**
 * @swagger
 * /api/etudiant/profil/universite:
 *   put:
 *     summary: Mettre à jour les informations universitaires
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
 *               - universite
 *               - filiere
 *               - niveauEtude
 *             properties:
 *               universite:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *                 example: "Université Omar Bongo"
 *               filiere:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 200
 *                 example: "Informatique"
 *               niveauEtude:
 *                 type: string
 *                 enum: [L1, L2, L3, M1, M2, Doctorat]
 *                 example: "L3"
 *     responses:
 *       200:
 *         description: Informations universitaires mises à jour avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function PUT(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'ETUDIANT') {
        throw ApiError.forbidden('Accès réservé aux étudiants');
      }

      const validated = await validateRequest(req, updateUniversiteSchema);
      await updateUniversiteUseCase.execute({
        userId: req.user.id,
        ...validated,
      });

      return NextResponse.json(
        ApiResponse.success(null, 'Informations universitaires mises à jour avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
