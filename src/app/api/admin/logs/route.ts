import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetSystemLogsUseCase } from '@/core/use-cases/admin/GetSystemLogs.usecase';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { listLogsSchema } from '@/presentation/validators/admin.validator';

const getSystemLogsUseCase = new GetSystemLogsUseCase();

/**
 * @swagger
 * /api/admin/logs:
 *   get:
 *     summary: Consulter les logs système
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
 *           default: 50
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, debug]
 *       - in: query
 *         name: dateDebut
 *         schema:
 *           type: string
 *           format: date-time
 *       - in: query
 *         name: dateFin
 *         schema:
 *           type: string
 *           format: date-time
 *     responses:
 *       200:
 *         description: Logs récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, listLogsSchema);

      const result = await getSystemLogsUseCase.execute({
        page: validated.page,
        limit: validated.limit,
        level: validated.level,
        dateDebut: validated.dateDebut ? new Date(validated.dateDebut) : undefined,
        dateFin: validated.dateFin ? new Date(validated.dateFin) : undefined,
      });

      return NextResponse.json(
        ApiResponse.success(result, 'Logs récupérés avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
