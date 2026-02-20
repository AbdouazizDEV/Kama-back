import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { UploadPhotoProfilUseCase } from '@/core/use-cases/locataire/UploadPhotoProfil.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const storageService = new SupabaseStorageService();
const uploadPhotoProfilUseCase = new UploadPhotoProfilUseCase(userRepository, storageService);

/**
 * @swagger
 * /api/locataire/profil/photo:
 *   post:
 *     summary: Uploader/modifier ma photo de profil
 *     tags: [Locataire]
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
 *     responses:
 *       200:
 *         description: Photo de profil uploadée avec succès
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
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const formData = await req.formData();
      const file = formData.get('photo') as File;

      if (!file) {
        throw ApiError.badRequest('Fichier photo requis');
      }

      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        throw ApiError.badRequest('Le fichier doit être une image');
      }

      // Vérifier la taille (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw ApiError.badRequest('La photo ne doit pas dépasser 2MB');
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const photoUrl = await uploadPhotoProfilUseCase.execute(
        req.user.id,
        buffer,
        file.name
      );

      return NextResponse.json(
        ApiResponse.success({ photoUrl }, 'Photo de profil uploadée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
