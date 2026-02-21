import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { GetMutuelleUseCase } from '@/core/use-cases/etudiant/GetMutuelle.usecase';
import { AdhererMutuelleUseCase } from '@/core/use-cases/etudiant/AdhererMutuelle.usecase';
import { SupabaseMutuelleRepository } from '@/infrastructure/database/repositories/SupabaseMutuelleRepository';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

const mutuelleRepository = new SupabaseMutuelleRepository();
const userRepository = new SupabaseUserRepository();
const getMutuelleUseCase = new GetMutuelleUseCase(mutuelleRepository, userRepository);
const adhererMutuelleUseCase = new AdhererMutuelleUseCase(mutuelleRepository, userRepository);

/**
 * @swagger
 * /api/etudiant/mutuelle:
 *   get:
 *     summary: Consulter mes informations mutuelle
 *     tags: [Étudiant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations mutuelle récupérées avec succès
 *       401:
 *         description: Non authentifié
 *       403:
 *         description: Accès refusé
 *   post:
 *     summary: Adhérer à la mutuelle de caution
 *     tags: [Étudiant]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Adhésion créée avec succès
 *       409:
 *         description: Adhésion déjà active
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'ETUDIANT') {
        throw ApiError.forbidden('Accès réservé aux étudiants');
      }

      const mutuelle = await getMutuelleUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(mutuelle, 'Informations mutuelle récupérées avec succès'),
        { status: 200 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}

export async function POST(request: NextRequest) {
  return withAuth(async (req: AuthenticatedRequest) => {
    try {
      if (req.user?.typeUtilisateur !== 'ETUDIANT') {
        throw ApiError.forbidden('Accès réservé aux étudiants');
      }

      const mutuelle = await adhererMutuelleUseCase.execute(req.user.id);

      return NextResponse.json(
        ApiResponse.success(
          {
            id: mutuelle.id,
            numeroAdhesion: mutuelle.numeroAdhesion,
            dateAdhesion: mutuelle.dateAdhesion,
          },
          'Adhésion à la mutuelle créée avec succès'
        ),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  })(request);
}
