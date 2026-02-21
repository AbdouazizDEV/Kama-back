import { NextRequest, NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/presentation/middlewares/admin.middleware';
import { SuspendUserUseCase } from '@/core/use-cases/admin/SuspendUser.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { suspendUserSchema } from '@/presentation/validators/admin.validator';

const userRepository = new SupabaseUserRepository();
const suspendUserUseCase = new SuspendUserUseCase(userRepository);

/**
 * @swagger
 * /api/admin/users/{id}/suspend:
 *   put:
 *     summary: Suspendre temporairement un compte
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
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               motif:
 *                 type: string
 *                 maxLength: 500
 *               duree:
 *                 type: integer
 *                 description: Durée de suspension en jours
 *     responses:
 *       200:
 *         description: Compte utilisateur suspendu avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Utilisateur non trouvé
 *       409:
 *         description: Le compte est déjà suspendu
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json().catch(() => ({}));
      const validated = suspendUserSchema.parse(body);

      await suspendUserUseCase.execute({
        userId: params.id,
        motif: validated.motif,
        duree: validated.duree,
      });

      return NextResponse.json(
        ApiResponse.success(null, 'Compte utilisateur suspendu avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
