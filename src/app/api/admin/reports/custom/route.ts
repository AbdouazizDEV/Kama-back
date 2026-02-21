import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GenerateCustomReportUseCase } from '@/core/use-cases/admin/GenerateCustomReport.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { SupabasePaiementRepository } from '@/infrastructure/database/repositories/SupabasePaiementRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { customReportSchema } from '@/presentation/validators/admin.validator';

const userRepository = new SupabaseUserRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const reservationRepository = new SupabaseReservationRepository();
const paiementRepository = new SupabasePaiementRepository();
const generateCustomReportUseCase = new GenerateCustomReportUseCase(
  userRepository,
  annonceRepository,
  reservationRepository,
  paiementRepository
);

/**
 * @swagger
 * /api/admin/reports/custom:
 *   post:
 *     summary: Générer un rapport personnalisé
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
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [users, annonces, reservations, paiements, activite]
 *               dateDebut:
 *                 type: string
 *                 format: date-time
 *               dateFin:
 *                 type: string
 *                 format: date-time
 *               filters:
 *                 type: object
 *               format:
 *                 type: string
 *                 enum: [JSON, CSV, PDF]
 *     responses:
 *       200:
 *         description: Rapport généré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function POST(request: NextRequest) {
  return withAdmin(async (req) => {
    try {
      const validated = await validateRequest(req, customReportSchema);

      const report = await generateCustomReportUseCase.execute({
        type: validated.type,
        dateDebut: validated.dateDebut ? new Date(validated.dateDebut) : undefined,
        dateFin: validated.dateFin ? new Date(validated.dateFin) : undefined,
        filters: validated.filters,
        format: validated.format,
      });

      return NextResponse.json(
        ApiResponse.success(report, 'Rapport généré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
