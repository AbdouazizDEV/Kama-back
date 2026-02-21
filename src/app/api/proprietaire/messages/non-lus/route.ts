import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { CountMessagesNonLusProprietaireUseCase } from '@/core/use-cases/proprietaire/CountMessagesNonLus.usecase';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { SupabaseReservationRepository } from '@/infrastructure/database/repositories/SupabaseReservationRepository';
import { SupabaseMessageRepository } from '@/infrastructure/database/repositories/SupabaseMessageRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const userRepository = new SupabaseUserRepository();
const reservationRepository = new SupabaseReservationRepository();
const messageRepository = new SupabaseMessageRepository();
const countMessagesNonLusUseCase = new CountMessagesNonLusProprietaireUseCase(
  messageRepository,
  userRepository,
  reservationRepository
);

/**
 * @swagger
 * /api/proprietaire/messages/non-lus:
 *   get:
 *     summary: Compter les messages non lus
 *     tags: [Propriétaire]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Nombre de messages non lus récupéré avec succès
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

      const count = await countMessagesNonLusUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success({ count }, 'Nombre de messages non lus récupéré avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
