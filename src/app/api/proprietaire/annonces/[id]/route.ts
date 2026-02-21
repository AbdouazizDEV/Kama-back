import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetAnnonceDetailProprietaireUseCase } from '@/core/use-cases/proprietaire/GetAnnonceDetail.usecase';
import { UpdateAnnonceUseCase } from '@/core/use-cases/annonces/UpdateAnnonce.usecase';
import { DeleteAnnonceProprietaireUseCase } from '@/core/use-cases/proprietaire/DeleteAnnonce.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { updateAnnonceProprietaireSchema } from '@/presentation/validators/proprietaire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const reservationRepository = new SupabaseReservationRepository();
const getAnnonceDetailUseCase = new GetAnnonceDetailProprietaireUseCase(
  annonceRepository,
  userRepository
);
const updateAnnonceUseCase = new UpdateAnnonceUseCase(annonceRepository);
const deleteAnnonceUseCase = new DeleteAnnonceProprietaireUseCase(
  annonceRepository,
  userRepository,
  reservationRepository
);

/**
 * @swagger
 * /api/proprietaire/annonces/{id}:
 *   get:
 *     summary: Consulter le détail d'une de mes annonces
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Détails de l'annonce récupérés avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Annonce non trouvée
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const annonce = await getAnnonceDetailUseCase.execute(params.id, req.user.id);

      return NextResponse.json(
        ApiResponse.success(annonce, 'Annonce récupérée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * @swagger
 * /api/proprietaire/annonces/{id}:
 *   put:
 *     summary: Modifier une annonce existante
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *               prix:
 *                 type: number
 *               caution:
 *                 type: number
 *               estMeuble:
 *                 type: boolean
 *               equipements:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Annonce modifiée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const validated = await validateRequest(req, updateAnnonceProprietaireSchema);
      const annonce = await updateAnnonceUseCase.execute({
        annonceId: params.id,
        proprietaireId: req.user.id,
        ...validated,
        dateDisponibilite: validated.dateDisponibilite
          ? new Date(validated.dateDisponibilite)
          : undefined,
      });

      return NextResponse.json(
        ApiResponse.success(
          {
            id: annonce.id,
            titre: annonce.titre,
            dateModification: annonce.dateModification,
          },
          'Annonce modifiée avec succès'
        ),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * @swagger
 * /api/proprietaire/annonces/{id}:
 *   delete:
 *     summary: Supprimer une annonce
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Annonce supprimée avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       409:
 *         description: Impossible de supprimer (réservations actives)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      await deleteAnnonceUseCase.execute(params.id, req.user.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Annonce supprimée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
