import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ListReservationsUseCase } from '@/core/use-cases/locataire/ListReservations.usecase';
import { CreateReservationUseCase } from '@/core/use-cases/reservations/CreateReservation.usecase';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { createReservationSchema } from '@/presentation/validators/locataire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const reservationRepository = new SupabaseReservationRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const userRepository = new SupabaseUserRepository();
const listReservationsUseCase = new ListReservationsUseCase(
  reservationRepository,
  annonceRepository
);
const createReservationUseCase = new CreateReservationUseCase(
  reservationRepository,
  annonceRepository,
  userRepository
);

/**
 * @swagger
 * /api/locataire/reservations:
 *   get:
 *     summary: Lister toutes mes réservations
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des réservations récupérée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const reservations = await listReservationsUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(reservations, 'Réservations récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * @swagger
 * /api/locataire/reservations:
 *   post:
 *     summary: Créer une nouvelle demande de réservation
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - annonceId
 *               - dateDebut
 *               - dateFin
 *               - nombrePersonnes
 *             properties:
 *               annonceId:
 *                 type: string
 *                 format: uuid
 *               dateDebut:
 *                 type: string
 *                 format: date-time
 *               dateFin:
 *                 type: string
 *                 format: date-time
 *               nombrePersonnes:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *               message:
 *                 type: string
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Réservation créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Annonce non trouvée
 *       409:
 *         description: Conflit de dates
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const validated = await validateRequest(req, createReservationSchema);
      const reservation = await createReservationUseCase.execute({
        annonceId: validated.annonceId,
        locataireId: req.user.id,
        dateDebut: new Date(validated.dateDebut),
        dateFin: new Date(validated.dateFin),
        nombrePersonnes: validated.nombrePersonnes,
        message: validated.message,
      });

      return NextResponse.json(
        ApiResponse.success(
          {
            id: reservation.id,
            annonceId: reservation.annonceId,
            dateDebut: reservation.dateDebut,
            dateFin: reservation.dateFin,
            statut: reservation.statut,
          },
          'Réservation créée avec succès'
        ),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
