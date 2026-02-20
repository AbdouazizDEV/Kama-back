import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ListAvisUseCase } from '@/core/use-cases/locataire/ListAvis.usecase';
import { CreateAvisUseCase } from '@/core/use-cases/locataire/CreateAvis.usecase';
import { SupabaseAvisRepository } from '@/infrastructure/database/repositories/SupabaseAvisRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { createAvisSchema } from '@/presentation/validators/locataire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const avisRepository = new SupabaseAvisRepository();
const reservationRepository = new SupabaseReservationRepository();
const listAvisUseCase = new ListAvisUseCase(avisRepository, reservationRepository);
const createAvisUseCase = new CreateAvisUseCase(avisRepository, reservationRepository);

/**
 * @swagger
 * /api/locataire/avis:
 *   get:
 *     summary: Consulter les avis que j'ai laissés
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des avis récupérée avec succès
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

      const avis = await listAvisUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(avis, 'Avis récupérés avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * @swagger
 * /api/locataire/avis:
 *   post:
 *     summary: Laisser un avis sur une annonce/propriétaire
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
 *               - reservationId
 *               - note
 *               - commentaire
 *             properties:
 *               reservationId:
 *                 type: string
 *                 format: uuid
 *               note:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               commentaire:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *     responses:
 *       201:
 *         description: Avis créé avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Réservation non trouvée
 *       409:
 *         description: Avis déjà existant ou réservation non terminée
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const validated = await validateRequest(req, createAvisSchema);
      const avis = await createAvisUseCase.execute({
        reservationId: validated.reservationId,
        locataireId: req.user.id,
        note: validated.note,
        commentaire: validated.commentaire,
      });

      return NextResponse.json(
        ApiResponse.success(
          {
            id: avis.id,
            reservationId: avis.reservationId,
            note: avis.note,
            commentaire: avis.commentaire,
          },
          'Avis créé avec succès'
        ),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
