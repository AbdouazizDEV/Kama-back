import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { RejectKycUseCase } from '@/core/use-cases/admin/RejectKyc.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { rejectKycSchema } from '@/presentation/validators/admin.validator';

const userRepository = new SupabaseUserRepository();
const rejectKycUseCase = new RejectKycUseCase(userRepository);

/**
 * @swagger
 * /api/admin/users/{id}/reject-kyc:
 *   put:
 *     summary: Rejeter la vérification KYC avec motif
 *     tags: [Administrateur]
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motif
 *             properties:
 *               motif:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Vérification KYC rejetée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async (req) => {
    try {
      const validated = await validateRequest(req, rejectKycSchema);

      await rejectKycUseCase.execute({
        userId: params.id,
        motif: validated.motif,
      });

      return NextResponse.json(
        ApiResponse.success(null, 'Vérification KYC rejetée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
