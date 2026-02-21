import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetProfilProprietaireUseCase } from '@/core/use-cases/proprietaire/GetProfil.usecase';
import { UpdateProfilProprietaireUseCase } from '@/core/use-cases/proprietaire/UpdateProfil.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { updateProfilProprietaireSchema } from '@/presentation/validators/proprietaire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const getProfilUseCase = new GetProfilProprietaireUseCase(userRepository);
const updateProfilUseCase = new UpdateProfilProprietaireUseCase(userRepository);

/**
 * @swagger
 * /api/proprietaire/profil:
 *   get:
 *     summary: Consulter mon profil complet
 *     tags: [Propriétaire]
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
 *                       enum: [PROPRIETAIRE]
 *                     estActif:
 *                       type: boolean
 *                     estVerifie:
 *                       type: boolean
 *                     dateInscription:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
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
 * /api/proprietaire/profil:
 *   put:
 *     summary: Modifier mes informations personnelles
 *     tags: [Propriétaire]
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
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const validated = await validateRequest(req, updateProfilProprietaireSchema);
      const profil = await updateProfilUseCase.execute(req.user.id, validated);

      return NextResponse.json(ApiResponse.success(profil, 'Profil modifié avec succès'), {
        status: 200,
      });
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
