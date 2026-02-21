import { NextRequest, NextResponse } from 'next/server';
import { withAdmin, AuthenticatedRequest } from '@/presentation/middlewares/admin.middleware';
import { ListUsersUseCase } from '@/core/use-cases/admin/ListUsers.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { listUsersSchema } from '@/presentation/validators/admin.validator';

const userRepository = new SupabaseUserRepository();
const listUsersUseCase = new ListUsersUseCase(userRepository);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lister tous les utilisateurs (avec filtres et pagination)
 *     tags: [Administrateur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: typeUtilisateur
 *         schema:
 *           type: string
 *           enum: [LOCATAIRE, PROPRIETAIRE, ETUDIANT, ADMIN]
 *       - in: query
 *         name: estActif
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: estVerifie
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des utilisateurs récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async (req: AuthenticatedRequest) => {
    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, listUsersSchema);

      const result = await listUsersUseCase.execute(validated);

      return NextResponse.json(
        ApiResponse.success(result, 'Liste des utilisateurs récupérée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
