import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetAnnonceDetailAdminUseCase } from '@/core/use-cases/admin/GetAnnonceDetailAdmin.usecase';
import { DeleteAnnonceAdminUseCase } from '@/core/use-cases/admin/DeleteAnnonceAdmin.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const annonceRepository = new SupabaseAnnonceRepository();
const getAnnonceDetailAdminUseCase = new GetAnnonceDetailAdminUseCase(annonceRepository);
const deleteAnnonceAdminUseCase = new DeleteAnnonceAdminUseCase(annonceRepository);

/**
 * @swagger
 * /api/admin/annonces/{id}:
 *   get:
 *     summary: Consulter le détail d'une annonce
 *     tags: [Administrateur]
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
 *         description: Détail de l'annonce récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Annonce non trouvée
 *   delete:
 *     summary: Supprimer une annonce
 *     tags: [Administrateur]
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
 *       404:
 *         description: Annonce non trouvée
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async () => {
    try {
      const annonce = await getAnnonceDetailAdminUseCase.execute(params.id);

      return NextResponse.json(
        ApiResponse.success(
          {
            id: annonce.id,
            proprietaireId: annonce.proprietaireId,
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
            statutModeration: annonce.statutModeration,
            nombreVues: annonce.nombreVues,
            dateCreation: annonce.dateCreation,
            dateModification: annonce.dateModification,
          },
          'Détail de l\'annonce récupéré avec succès'
        ),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async () => {
    try {
      await deleteAnnonceAdminUseCase.execute(params.id);

      return NextResponse.json(
        ApiResponse.success(null, 'Annonce supprimée avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
