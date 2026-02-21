import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { SetPhotoPrincipaleProprietaireUseCase } from '@/core/use-cases/proprietaire/SetPhotoPrincipale.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const setPhotoPrincipaleUseCase = new SetPhotoPrincipaleProprietaireUseCase(
  annonceRepository,
  userRepository
);

/**
 * @swagger
 * /api/proprietaire/annonces/{id}/photos/{photoId}/principale:
 *   put:
 *     summary: Définir comme photo principale
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
 *         description: URL de la photo à définir comme principale
 *     responses:
 *       200:
 *         description: Photo principale définie avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; photoId: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      await setPhotoPrincipaleUseCase.execute(
        params.id,
        decodeURIComponent(params.photoId),
        req.user.id
      );

      return NextResponse.json(
        ApiResponse.success(null, 'Photo principale définie avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
