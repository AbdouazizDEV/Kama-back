import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { DeletePhotoAnnonceProprietaireUseCase } from '@/core/use-cases/proprietaire/DeletePhotoAnnonce.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const storageService = new SupabaseStorageService();
const deletePhotoUseCase = new DeletePhotoAnnonceProprietaireUseCase(
  annonceRepository,
  userRepository,
  storageService
);

/**
 * @swagger
 * /api/proprietaire/annonces/{id}/photos/{photoId}:
 *   delete:
 *     summary: Supprimer une photo
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
 *       - in: path
 *         name: photoId
 *         required: true
 *         schema:
 *           type: string
 *         description: URL de la photo à supprimer
 *     responses:
 *       200:
 *         description: Photo supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       409:
 *         description: Impossible de supprimer (dernière photo)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      // photoId est en fait l'URL de la photo
      await deletePhotoUseCase.execute(params.id, decodeURIComponent(params.photoId), req.user.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Photo supprimée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
