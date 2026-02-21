import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetSystemConfigUseCase } from '@/core/use-cases/admin/GetSystemConfig.usecase';
import { UpdateSystemConfigUseCase } from '@/core/use-cases/admin/UpdateSystemConfig.usecase';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { updateConfigSchema } from '@/presentation/validators/admin.validator';

const getSystemConfigUseCase = new GetSystemConfigUseCase();
const updateSystemConfigUseCase = new UpdateSystemConfigUseCase();

/**
 * @swagger
 * /api/admin/config:
 *   get:
 *     summary: Obtenir la configuration actuelle
 *     tags: [Administrateur]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Configuration récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *   put:
 *     summary: Modifier la configuration système
 *     tags: [Administrateur]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: any
 *     responses:
 *       200:
 *         description: Configuration modifiée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async () => {
    try {
      const config = await getSystemConfigUseCase.execute();

      return NextResponse.json(
        ApiResponse.success(config, 'Configuration récupérée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

export async function PUT(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const validated = await validateRequest(req, updateConfigSchema);

      await updateSystemConfigUseCase.execute({
        key: validated.key,
        value: validated.value,
      });

      return NextResponse.json(
        ApiResponse.success(null, 'Configuration modifiée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
