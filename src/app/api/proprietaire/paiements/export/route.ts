import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ExportPaiementsProprietaireUseCase } from '@/core/use-cases/proprietaire/ExportPaiements.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { exportPaiementsSchema } from '@/presentation/validators/proprietaire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const paiementRepository = new SupabasePaiementRepository();
const exportPaiementsUseCase = new ExportPaiementsProprietaireUseCase(
  paiementRepository,
  userRepository
);

/**
 * @swagger
 * /api/proprietaire/paiements/export:
 *   get:
 *     summary: Exporter l'historique pour comptabilité (CSV/PDF)
 *     tags: [Propriétaire]
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
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, exportPaiementsSchema);

      const exportData = await exportPaiementsUseCase.execute({
        proprietaireId: req.user.id,
        format: validated.format,
        dateDebut: validated.dateDebut ? new Date(validated.dateDebut) : undefined,
        dateFin: validated.dateFin ? new Date(validated.dateFin) : undefined,
      });

      if (validated.format === 'CSV') {
        return new NextResponse(exportData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="paiements-${Date.now()}.csv"`,
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
