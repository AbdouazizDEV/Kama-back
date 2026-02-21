import { NextRequest, NextResponse } from 'next/server';
import { withAdmin } from '@/presentation/middlewares/admin.middleware';
import { FeatureAnnonceUseCase } from '@/core/use-cases/admin/FeatureAnnonce.usecase';
import { SupabaseAnnonceRepository } from '@/infrastructure/database/repositories/SupabaseAnnonceRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { featureAnnonceSchema } from '@/presentation/validators/admin.validator';

const annonceRepository = new SupabaseAnnonceRepository();
const featureAnnonceUseCase = new FeatureAnnonceUseCase(annonceRepository);

/**
 * @swagger
 * /api/admin/annonces/{id}/feature:
 *   put:
 *     summary: Mettre en avant une annonce
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - featured
 *             properties:
 *               featured:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Statut de mise en avant modifié avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *       404:
 *         description: Annonce non trouvée
 *       409:
 *         description: Seules les annonces approuvées peuvent être mises en avant
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAdmin(async (req) => {
    try {
      const validated = await validateRequest(req, featureAnnonceSchema);

      await featureAnnonceUseCase.execute({
        annonceId: params.id,
        featured: validated.featured,
      });

      return NextResponse.json(
        ApiResponse.success(null, 'Statut de mise en avant modifié avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
