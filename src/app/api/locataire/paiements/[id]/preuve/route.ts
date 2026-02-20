import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { UploadPreuvePaiementUseCase } from '@/core/use-cases/locataire/UploadPreuvePaiement.usecase';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const paiementRepository = new SupabasePaiementRepository();
const storageService = new SupabaseStorageService();
const uploadPreuvePaiementUseCase = new UploadPreuvePaiementUseCase(
  paiementRepository,
  storageService
);

/**
 * @swagger
 * /api/locataire/paiements/{id}/preuve:
 *   post:
 *     summary: Uploader la preuve de paiement (MVP manuel)
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID du paiement
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - preuve
 *             properties:
 *               preuve:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Preuve de paiement uploadée avec succès
 *       400:
 *         description: Fichier invalide
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Paiement non trouvé
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const { id } = params;
      const formData = await req.formData();
      const file = formData.get('preuve') as File;

      if (!file) {
        throw ApiError.badRequest('Fichier preuve requis');
      }

      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw ApiError.badRequest('Le fichier ne doit pas dépasser 10MB');
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const preuveUrl = await uploadPreuvePaiementUseCase.execute(
        id,
        req.user.id,
        buffer,
        file.name
      );

      return NextResponse.json(
        ApiResponse.success({ preuveUrl }, 'Preuve de paiement uploadée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
