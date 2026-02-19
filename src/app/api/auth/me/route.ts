import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { supabaseAdmin } from '@/config/supabase.config';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';

async function handler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    if (!request.user) {
      throw ApiError.unauthorized();
    }

    // Récupérer les données utilisateur depuis notre table
    const { data: userData, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', request.user.id)
      .single();

    if (dbError || !userData) {
      throw ApiError.notFound('Utilisateur');
    }

    return NextResponse.json(
      ApiResponse.success({
        id: userData.id,
        email: userData.email,
        nom: userData.nom,
        prenom: userData.prenom,
        telephone: userData.telephone,
        photoProfil: userData.photo_profil,
        typeUtilisateur: userData.type_utilisateur,
        estActif: userData.est_actif,
        estVerifie: userData.est_verifie,
        dateInscription: userData.date_inscription,
      })
    );
  } catch (error) {
    return handleError(error);
  }
}

export const GET = withAuth(handler);
