import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const storageService = new SupabaseStorageService();

/**
 * @swagger
 * /api/locataire/profil/documents:
 *   post:
 *     summary: Uploader des documents justificatifs (KYC)
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
 *               - document
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *               typeDocument:
 *                 type: string
 *                 enum: [CNI, PASSPORT, PERMIS_CONDUIRE, JUSTIFICATIF_DOMICILE]
 *     responses:
 *       200:
 *         description: Document uploadé avec succès
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
      const file = formData.get('document') as File;
      const typeDocument = formData.get('typeDocument') as string;

      if (!file) {
        throw ApiError.badRequest('Fichier document requis');
      }

      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw ApiError.badRequest('Le document ne doit pas dépasser 10MB');
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // TODO: Implémenter le stockage des documents avec métadonnées
      const documentUrl = await storageService.uploadDocument(buffer, file.name, req.user.id);

      return NextResponse.json(
        ApiResponse.success(
          { documentUrl, typeDocument },
          'Document uploadé avec succès'
        ),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
