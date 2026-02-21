import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { ValidateKycUseCase } from '@/core/use-cases/admin/ValidateKyc.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const userRepository = new SupabaseUserRepository();
const validateKycUseCase = new ValidateKycUseCase(userRepository);

/**
 * @swagger
 * /api/admin/users/{id}/validate-kyc:
 *   put:
 *     summary: Valider la vérification KYC d'un utilisateur
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
 *     responses:
 *       200:
 *         description: Vérification KYC validée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 *       409:
 *         description: La vérification KYC est déjà validée
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async () => {
    try {
      await validateKycUseCase.execute(params.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Vérification KYC validée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
