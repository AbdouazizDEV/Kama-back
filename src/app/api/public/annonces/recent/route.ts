import { NextRequest, NextResponse } from 'next/server';
import { GetRecentAnnoncesUseCase } from '@/core/use-cases/public/GetRecentAnnonces.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const annonceRepository = new SupabaseAnnonceRepository();
const getRecentAnnoncesUseCase = new GetRecentAnnoncesUseCase(annonceRepository);

/**
 * @swagger
 * /api/public/annonces/recent:
 *   get:
 *     summary: Obtenir les dernières annonces publiées
 *     tags: [Public]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 20
 *         description: Nombre d'annonces à retourner
 *     responses:
 *       200:
 *         description: Liste des dernières annonces
 *       500:
 *         description: Erreur serveur
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    const annonces = await getRecentAnnoncesUseCase.execute({ limit });

    // Formater les annonces
    const annoncesData = annonces.map((annonce) => ({
      id: annonce.id,
      titre: annonce.titre,
      description: annonce.description,
      typeBien: annonce.typeBien,
      categorieBien: annonce.categorieBien,
      prix: annonce.prix.getMontant(),
      caution: annonce.caution.getMontant(),
      ville: annonce.adresse.ville,
      quartier: annonce.adresse.quartier,
      photos: annonce.photos,
      dateCreation: annonce.dateCreation,
    }));

    return NextResponse.json(
      ApiResponse.success(annoncesData, 'Dernières annonces récupérées avec succès'),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
