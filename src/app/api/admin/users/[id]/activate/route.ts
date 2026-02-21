import { NextRequest, NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/presentation/middlewares/admin.middleware';
import { ActivateUserUseCase } from '@/core/use-cases/admin/ActivateUser.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const userRepository = new SupabaseUserRepository();
const activateUserUseCase = new ActivateUserUseCase(userRepository);

/**
 * @swagger
 * /api/admin/users/{id}/activate:
 *   put:
 *     summary: Activer un compte utilisateur
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
 *         description: Compte utilisateur activé avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 *       409:
 *         description: Le compte est déjà actif
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      await activateUserUseCase.execute(params.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Compte utilisateur activé avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
