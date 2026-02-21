import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { ExportPaiementsAdminUseCase } from '@/core/use-cases/admin/ExportPaiementsAdmin.usecase';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { exportPaiementsAdminSchema } from '@/presentation/validators/admin.validator';
import { ApiError } from '@/shared/utils/ApiError';

const paiementRepository = new SupabasePaiementRepository();
const exportPaiementsAdminUseCase = new ExportPaiementsAdminUseCase(paiementRepository);

/**
 * @swagger
 * /api/admin/paiements/export:
 *   get:
 *     summary: Exporter les données financières (CSV)
 *     tags: [Administrateur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         required: true
 *         schema:
 *           type: string
 *           enum: [CSV, PDF]
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
 *         description: Export généré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, exportPaiementsAdminSchema);

      const exportData = await exportPaiementsAdminUseCase.execute({
        format: validated.format,
        dateDebut: validated.dateDebut ? new Date(validated.dateDebut) : undefined,
        dateFin: validated.dateFin ? new Date(validated.dateFin) : undefined,
      });

      if (validated.format === 'CSV') {
        return new NextResponse(exportData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="paiements-admin-${Date.now()}.csv"`,
          },
        });
      }

      return NextResponse.json(
        ApiResponse.success({ data: exportData }, 'Export généré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
