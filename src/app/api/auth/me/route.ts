import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { SupabaseUserRepository } from '@/infrastructure/database/repositories/SupabaseUserRepository';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

async function handler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    if (!request.user) {
      throw ApiError.unauthorized();
    }

    const userRepository = new SupabaseUserRepository();
    const user = await userRepository.findById(request.user.id);

    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    return NextResponse.json(
      ApiResponse.success({
        id: user.id,
        email: user.email.getValue(),
        nom: user.nom,
        prenom: user.prenom,
        telephone: user.telephone,
        photoProfil: user.photoProfil,
        typeUtilisateur: user.typeUtilisateur,
        estActif: user.estActif,
        estVerifie: user.estVerifie,
        dateInscription: user.dateInscription,
      })
    );
  } catch (error) {
    return handleError(error);
  }
}

export const GET = withAuth(handler);
