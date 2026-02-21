import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetLocataireProfilProprietaireUseCase } from '@/core/use-cases/proprietaire/GetLocataireProfil.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const reservationRepository = new SupabaseReservationRepository();
const getLocataireProfilUseCase = new GetLocataireProfilProprietaireUseCase(
  reservationRepository,
  userRepository
);

/**
 * @swagger
 * /api/proprietaire/reservations/{id}/locataire:
 *   get:
 *     summary: Consulter le profil du locataire
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
 *         description: Profil du locataire récupéré avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
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

      const locataire = await getLocataireProfilUseCase.execute(params.id, req.user.id);

      return NextResponse.json(
        ApiResponse.success(locataire, 'Profil du locataire récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
