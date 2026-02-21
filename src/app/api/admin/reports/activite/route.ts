import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetActiviteReportUseCase } from '@/core/use-cases/admin/GetActiviteReport.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateQuery } from '@/presentation/middlewares/validation.middleware';
import { z } from 'zod';

const userRepository = new SupabaseUserRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const reservationRepository = new SupabaseReservationRepository();
const paiementRepository = new SupabasePaiementRepository();
const getActiviteReportUseCase = new GetActiviteReportUseCase(
  userRepository,
  annonceRepository,
  reservationRepository,
  paiementRepository
);

const activiteReportSchema = z.object({
  dateDebut: z.string().datetime().optional(),
  dateFin: z.string().datetime().optional(),
});

/**
 * @swagger
 * /api/admin/reports/activite:
 *   get:
 *     summary: Rapport d'activité globale
 *     tags: [Administrateur]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: Rapport récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
      const validated = validateQuery(searchParams, activiteReportSchema);

      const report = await getActiviteReportUseCase.execute(
        validated.dateDebut ? new Date(validated.dateDebut) : undefined,
        validated.dateFin ? new Date(validated.dateFin) : undefined
      );

      return NextResponse.json(
        ApiResponse.success(report, 'Rapport récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
