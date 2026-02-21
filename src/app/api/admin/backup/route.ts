import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { CreateBackupUseCase } from '@/core/use-cases/admin/CreateBackup.usecase';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const createBackupUseCase = new CreateBackupUseCase();

/**
 * @swagger
 * /api/admin/backup:
 *   post:
 *     summary: Déclencher une sauvegarde manuelle
 *     tags: [Administrateur]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sauvegarde créée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function POST(request: NextRequest) {
  return withAdmin(async () => {
    try {
      const backup = await createBackupUseCase.execute();

      return NextResponse.json(
        ApiResponse.success(backup, 'Sauvegarde créée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
