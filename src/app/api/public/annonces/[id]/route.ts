import { NextRequest, NextResponse } from 'next/server';
import { GetPublicAnnonceUseCase } from '@/core/use-cases/public/GetPublicAnnonce.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const annonceRepository = new SupabaseAnnonceRepository();
const getPublicAnnonceUseCase = new GetPublicAnnonceUseCase(annonceRepository);

/**
 * @swagger
 * /api/public/annonces/{id}:
 *   get:
 *     summary: Consulter le détail d'une annonce spécifique
 *     tags: [Public]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'annonce
 *     responses:
 *       200:
 *         description: Détails de l'annonce
 *       404:
 *         description: Annonce non trouvée
 *       500:
 *         description: Erreur serveur
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const annonce = await getPublicAnnonceUseCase.execute({
      annonceId: params.id,
      incrementViews: true,
    });

    // Formater la réponse
    const annonceData = {
      id: annonce.id,
      titre: annonce.titre,
      description: annonce.description,
      typeBien: annonce.typeBien,
      categorieBien: annonce.categorieBien,
      prix: annonce.prix.getMontant(),
      caution: annonce.caution.getMontant(),
      ville: annonce.adresse.ville,
      quartier: annonce.adresse.quartier,
      adresseComplete: annonce.adresse.adresseComplete,
      latitude: annonce.adresse.latitude,
      longitude: annonce.adresse.longitude,
      superficie: annonce.superficie,
      nombrePieces: annonce.nombrePieces,
      estMeuble: annonce.estMeuble,
      equipements: annonce.equipements,
      photos: annonce.photos,
      estDisponible: annonce.estDisponible,
      dateDisponibilite: annonce.dateDisponibilite,
      nombreVues: annonce.nombreVues,
      dateCreation: annonce.dateCreation,
    };

    return NextResponse.json(
      ApiResponse.success(annonceData, 'Annonce récupérée avec succès'),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
