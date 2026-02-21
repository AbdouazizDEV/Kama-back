import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { UploadDocumentsVerificationProprietaireUseCase } from '@/core/use-cases/proprietaire/UploadDocumentsVerification.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const storageService = new SupabaseStorageService();
const uploadDocumentsUseCase = new UploadDocumentsVerificationProprietaireUseCase(
  userRepository,
  storageService
);

/**
 * @swagger
 * /api/proprietaire/profil/verification:
 *   post:
 *     summary: Uploader documents de vérification KYC
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
 *               - pieceIdentite
 *             properties:
 *               pieceIdentite:
 *                 type: string
 *                 format: binary
 *                 description: Pièce d'identité (JPEG, PNG, PDF, max 5MB)
 *               justificatifDomicile:
 *                 type: string
 *                 format: binary
 *                 description: Justificatif de domicile (JPEG, PNG, PDF, max 5MB)
 *     responses:
 *       200:
 *         description: Documents uploadés avec succès
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
      const pieceIdentite = formData.get('pieceIdentite') as File;
      const justificatifDomicile = formData.get('justificatifDomicile') as File | null;

      if (!pieceIdentite) {
        throw ApiError.badRequest('Pièce d\'identité requise');
      }

      await uploadDocumentsUseCase.execute({
        userId: req.user.id,
        pieceIdentite,
        justificatifDomicile: justificatifDomicile || undefined,
      });

      return NextResponse.json(
        ApiResponse.success(null, 'Documents uploadés avec succès. Vérification en cours.'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
