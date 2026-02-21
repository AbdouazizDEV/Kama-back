import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { GetLitigeDetailUseCase } from '@/core/use-cases/admin/GetLitigeDetail.usecase';
import { SupabaseLitigeRepository } from '@/infrastructure/database/repositories/SupabaseLitigeRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';

const litigeRepository = new SupabaseLitigeRepository();
const getLitigeDetailUseCase = new GetLitigeDetailUseCase(litigeRepository);

/**
 * @swagger
 * /api/admin/litiges/{id}:
 *   get:
 *     summary: Consulter le détail d'un litige
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
 *         description: Détail du litige récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Litige non trouvé
 *       501:
 *         description: Fonctionnalité non encore implémentée (modèle Litige à créer)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async () => {
    try {
      const litige = await getLitigeDetailUseCase.execute(params.id);

      return NextResponse.json(
        ApiResponse.success(
          {
            id: litige.id,
            reservationId: litige.reservationId,
            locataireId: litige.locataireId,
            proprietaireId: litige.proprietaireId,
            type: litige.type,
            description: litige.description,
            statut: litige.statut,
            resolution: litige.resolution,
            commentaires: litige.commentaires,
            dateCreation: litige.dateCreation,
            dateModification: litige.dateModification,
          },
          'Détail du litige récupéré avec succès'
        ),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
