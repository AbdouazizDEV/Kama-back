import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { DeletePhotoProfilUseCase } from '@/core/use-cases/locataire/DeletePhotoProfil.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const storageService = new SupabaseStorageService();
const deletePhotoProfilUseCase = new DeletePhotoProfilUseCase(userRepository, storageService);

/**
 * @swagger
 * /api/locataire/profil/photo:
 *   delete:
 *     summary: Supprimer ma photo de profil
 *     tags: [Locataire]
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
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

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
