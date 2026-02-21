import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { UploadPhotoProfilProprietaireUseCase } from '@/core/use-cases/proprietaire/UploadPhotoProfil.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const storageService = new SupabaseStorageService();
const uploadPhotoProfilUseCase = new UploadPhotoProfilProprietaireUseCase(
  userRepository,
  storageService
);

/**
 * @swagger
 * /api/proprietaire/profil/photo:
 *   post:
 *     summary: Uploader/modifier ma photo de profil
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photo
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: Image (JPEG, PNG, WebP, max 5MB)
 *     responses:
 *       200:
 *         description: Photo de profil uploadée avec succès
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
 *                     photoUrl:
 *                       type: string
 *       400:
 *         description: Fichier invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const formData = await req.formData();
      const file = formData.get('photo') as File;

      if (!file) {
        throw ApiError.badRequest('Fichier photo requis');
      }

      const photoUrl = await uploadPhotoProfilUseCase.execute({
        userId: req.user.id,
        photo: file,
      });

      return NextResponse.json(
        ApiResponse.success({ photoUrl }, 'Photo de profil uploadée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * @swagger
 * /api/proprietaire/profil/photo:
 *   delete:
 *     summary: Supprimer ma photo de profil
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Photo de profil supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Photo de profil non trouvée
 */
export async function DELETE(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const { DeletePhotoProfilProprietaireUseCase } = await import('@/core/use-cases/proprietaire/DeletePhotoProfil.usecase');
      const deletePhotoProfilUseCase = new DeletePhotoProfilProprietaireUseCase(
        userRepository,
        storageService
      );

      await deletePhotoProfilUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Photo de profil supprimée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
