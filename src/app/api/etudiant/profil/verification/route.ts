import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { UploadDocumentsVerificationUseCase } from '@/core/use-cases/etudiant/UploadDocumentsVerification.usecase';
import { SupabaseEtudiantRepository } from '@/infrastructure/database/repositories/SupabaseEtudiantRepository';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const etudiantRepository = new SupabaseEtudiantRepository();
const userRepository = new SupabaseUserRepository();
const storageService = new SupabaseStorageService();
const uploadDocumentsUseCase = new UploadDocumentsVerificationUseCase(
  etudiantRepository,
  userRepository,
  storageService
);

/**
 * @swagger
 * /api/etudiant/profil/verification:
 *   post:
 *     summary: Uploader carte étudiante et attestation d'inscription
 *     tags: [Étudiant]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - carteEtudiante
 *               - attestationInscription
 *             properties:
 *               carteEtudiante:
 *                 type: string
 *                 format: binary
 *                 description: Fichier de la carte étudiante (PDF, JPG, PNG, max 5MB)
 *               attestationInscription:
 *                 type: string
 *                 format: binary
 *                 description: Fichier de l'attestation d'inscription (PDF, JPG, PNG, max 5MB)
 *     responses:
 *       200:
 *         description: Documents uploadés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   nullable: true
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'ETUDIANT') {
        throw ApiError.forbidden('Accès réservé aux étudiants');
      }

      const formData = await request.formData();
      const carteEtudiante = formData.get('carteEtudiante') as File | null;
      const attestationInscription = formData.get('attestationInscription') as File | null;

      if (!carteEtudiante || !attestationInscription) {
        throw ApiError.badRequest('Les deux fichiers sont requis');
      }

      await uploadDocumentsUseCase.execute({
        userId: req.user.id,
        carteEtudiante,
        attestationInscription,
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
