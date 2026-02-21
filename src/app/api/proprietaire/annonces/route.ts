import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ListAnnoncesProprietaireUseCase } from '@/core/use-cases/proprietaire/ListAnnonces.usecase';
import { CreateAnnonceUseCase } from '@/core/use-cases/annonces/CreateAnnonce.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { createAnnonceProprietaireSchema } from '@/presentation/validators/proprietaire.validator';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const listAnnoncesUseCase = new ListAnnoncesProprietaireUseCase(annonceRepository, userRepository);
const createAnnonceUseCase = new CreateAnnonceUseCase(annonceRepository, userRepository);

/**
 * @swagger
 * /api/proprietaire/annonces:
 *   get:
 *     summary: Lister toutes mes annonces
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des annonces récupérée avec succès
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

      const annonces = await listAnnoncesUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(annonces, 'Annonces récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * @swagger
 * /api/proprietaire/annonces:
 *   post:
 *     summary: Créer une nouvelle annonce
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - titre
 *               - description
 *               - typeBien
 *               - categorieBien
 *               - prix
 *               - caution
 *               - ville
 *               - quartier
 *               - adresseComplete
 *               - estMeuble
 *               - equipements
 *               - dateDisponibilite
 *             properties:
 *               titre:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *               description:
 *                 type: string
 *                 minLength: 50
 *                 maxLength: 5000
 *               typeBien:
 *                 type: string
 *                 enum: [APPARTEMENT, MAISON, TERRAIN, VEHICULE]
 *               categorieBien:
 *                 type: string
 *               prix:
 *                 type: number
 *                 minimum: 0
 *               caution:
 *                 type: number
 *                 minimum: 0
 *               ville:
 *                 type: string
 *               quartier:
 *                 type: string
 *               adresseComplete:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               superficie:
 *                 type: number
 *               nombrePieces:
 *                 type: integer
 *               estMeuble:
 *                 type: boolean
 *               equipements:
 *                 type: array
 *                 items:
 *                   type: string
 *               dateDisponibilite:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Annonce créée avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'PROPRIETAIRE') {
        throw ApiError.forbidden('Accès réservé aux propriétaires');
      }

      const validated = await validateRequest(req, createAnnonceProprietaireSchema);
      const annonce = await createAnnonceUseCase.execute({
        ...validated,
        proprietaireId: req.user.id,
        dateDisponibilite: new Date(validated.dateDisponibilite),
      });

      return NextResponse.json(
        ApiResponse.success(
          {
            id: annonce.id,
            titre: annonce.titre,
            statutModeration: annonce.statutModeration,
          },
          'Annonce créée avec succès'
        ),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
