import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { UploadPhotosAnnonceProprietaireUseCase } from '@/core/use-cases/proprietaire/UploadPhotosAnnonce.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const storageService = new SupabaseStorageService();
const uploadPhotosUseCase = new UploadPhotosAnnonceProprietaireUseCase(
  annonceRepository,
  userRepository,
  storageService
);

/**
 * @swagger
 * /api/proprietaire/annonces/{id}/photos:
 *   post:
 *     summary: Uploader des photos pour une annonce
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - photos
 *             properties:
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Photos (JPEG, PNG, WebP, max 5MB chacune, max 10 photos total)
 *     responses:
 *       200:
 *         description: Photos uploadées avec succès
 *       400:
 *         description: Fichiers invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const formData = await req.formData();
      const photos = formData.getAll('photos') as File[];

      if (photos.length === 0) {
        throw ApiError.badRequest('Au moins une photo est requise');
      }

      const photoUrls = await uploadPhotosUseCase.execute({
        annonceId: params.id,
        proprietaireId: req.user.id,
        photos,
      });

      return NextResponse.json(
        ApiResponse.success({ photoUrls }, 'Photos uploadées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
