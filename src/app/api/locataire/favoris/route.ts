import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { ListFavorisUseCase } from '@/core/use-cases/locataire/ListFavoris.usecase';
import { AddFavoriUseCase } from '@/core/use-cases/locataire/AddFavori.usecase';
import { SupabaseFavoriRepository } from '@/infrastructure/database/repositories/SupabaseFavoriRepository';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { z } from 'zod';

const favoriRepository = new SupabaseFavoriRepository();
const annonceRepository = new SupabaseAnnonceRepository();
const listFavorisUseCase = new ListFavorisUseCase(favoriRepository, annonceRepository);
const addFavoriUseCase = new AddFavoriUseCase(favoriRepository, annonceRepository);

const addFavoriSchema = z.object({
  annonceId: z.string().uuid('ID d\'annonce invalide'),
});

/**
 * @swagger
 * /api/locataire/favoris:
 *   get:
 *     summary: Lister mes annonces favorites
 *     tags: [Locataire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des favoris récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       favori:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           dateAjout:
 *                             type: string
 *                             format: date-time
 *                       annonce:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           titre:
 *                             type: string
 *                           description:
 *                             type: string
 *                           typeBien:
 *                             type: string
 *                           prix:
 *                             type: number
 *                           ville:
 *                             type: string
 *                           quartier:
 *                             type: string
 *                           photos:
 *                             type: array
 *                             items:
 *                               type: string
 *                           estDisponible:
 *                             type: boolean
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

      const favoris = await listFavorisUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(favoris, 'Favoris récupérés avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

/**
 * @swagger
 * /api/locataire/favoris:
 *   post:
 *     summary: Ajouter une annonce aux favoris
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
 *             properties:
 *               annonceId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Annonce ajoutée aux favoris avec succès
 *       400:
 *         description: Données invalides
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Annonce non trouvée
 *       409:
 *         description: Déjà en favoris
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'LOCATAIRE') {
        throw ApiError.forbidden('Accès réservé aux locataires');
      }

      const validated = await validateRequest(req, addFavoriSchema);
      const favori = await addFavoriUseCase.execute(req.user.id, validated.annonceId);

      return NextResponse.json(
        ApiResponse.success(
          { id: favori.id, annonceId: favori.annonceId, dateAjout: favori.dateAjout },
          'Annonce ajoutée aux favoris avec succès'
        ),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
