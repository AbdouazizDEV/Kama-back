import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetProfilUseCase } from '@/core/use-cases/locataire/GetProfil.usecase';
import { UpdateProfilUseCase } from '@/core/use-cases/locataire/UpdateProfil.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { updateProfilSchema } from '@/presentation/validators/locataire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const getProfilUseCase = new GetProfilUseCase(userRepository);
const updateProfilUseCase = new UpdateProfilUseCase(userRepository);

/**
 * @swagger
 * /api/locataire/profil:
 *   get:
 *     summary: Consulter mon profil complet
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil récupéré avec succès
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
 *                     id:
 *                       type: string
 *                       format: uuid
 *                     email:
 *                       type: string
 *                     nom:
 *                       type: string
 *                     prenom:
 *                       type: string
 *                     telephone:
 *                       type: string
 *                     photoProfil:
 *                       type: string
 *                       nullable: true
 *                     typeUtilisateur:
 *                       type: string
 *                     estActif:
 *                       type: boolean
 *                     estVerifie:
 *                       type: boolean
 *                     dateInscription:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Non authentifié
 *       404:
 *         description: Utilisateur non trouvé
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      // Vérifier que l'utilisateur est un locataire
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const profil = await getProfilUseCase.execute(req.user.id);

      return NextResponse.json(ApiResponse.success(profil, 'Profil récupéré avec succès'), {
        status: 200,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * @swagger
 * /api/locataire/profil:
 *   put:
 *     summary: Modifier mes informations personnelles
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               prenom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               telephone:
 *                 type: string
 *                 pattern: '^\+?[0-9]{8,15}$'
 *     responses:
 *       200:
 *         description: Profil modifié avec succès
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
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const validated = await validateRequest(req, updateProfilSchema);
      const profil = await updateProfilUseCase.execute(req.user.id, validated);

      return NextResponse.json(ApiResponse.success(profil, 'Profil modifié avec succès'), {
        status: 200,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
