import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/presentation/middlewares/auth.middleware';
import { supabaseAdmin } from '@/config/supabase.config';
import { SupabaseAuthService } from '@/infrastructure/auth/SupabaseAuthService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { ApiError } from '@/shared/utils/ApiError';
import { logger } from '@/shared/utils/logger';

/** public.users row (snake_case columns from Supabase) */
type UsersTableRow = {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  telephone: string | null;
  photo_profil: string | null;
  type_utilisateur: string;
  est_actif: boolean;
  est_verifie: boolean;
  date_inscription: string;
};

async function handler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    if (!request.user) {
      throw ApiError.unauthorized();
    }

    // Récupérer les données utilisateur depuis notre table
    const { data: initialUserData, error: dbError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', request.user.id)
      .single();

    let userData = initialUserData;

    // Si l'utilisateur n'existe pas dans notre table, le créer depuis Supabase Auth
    if (dbError || !userData) {
      logger.info(`Utilisateur ${request.user.id} non trouvé dans la table users, création depuis Supabase Auth...`);

      // Récupérer les données depuis Supabase Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
        request.user.id
      );

      if (authError || !authUser.user) {
        throw ApiError.notFound('Utilisateur introuvable dans Supabase Auth');
      }

      const user = authUser.user;
      const metadata = user.user_metadata || {};

      // Créer l'utilisateur dans notre table
      const authService = new SupabaseAuthService();
      try {
        await authService.createUserInDatabase(
          user.id,
          user.email || request.user.email,
          metadata.nom || 'Non défini',
          metadata.prenom || 'Non défini',
          metadata.telephone || '',
          metadata.type_utilisateur || metadata.typeUtilisateur || 'LOCATAIRE'
        );

        // Récupérer les données créées
        const { data: newUserData, error: newUserError } = await supabaseAdmin
          .from('users')
          .select('*')
          .eq('id', request.user.id)
          .single();

        if (newUserError || !newUserData) {
          throw ApiError.internal('Erreur lors de la création de l\'utilisateur');
        }

        userData = newUserData;
        logger.info(`Utilisateur ${request.user.id} créé avec succès dans la table users`);
      } catch (createError: unknown) {
        // Si l'erreur est due à un utilisateur déjà existant (race condition), récupérer les données
        const errorMessage = createError instanceof Error ? createError.message : String(createError);
        if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', request.user.id)
            .single();

          if (existingUser) {
            userData = existingUser;
          } else {
            throw createError;
          }
        } else {
          throw createError;
        }
      }
    }

    if (!userData) {
      throw ApiError.notFound('Utilisateur');
    }

    const u = userData as UsersTableRow;

    return NextResponse.json(
      ApiResponse.success({
        id: u.id,
        email: u.email,
        nom: u.nom,
        prenom: u.prenom,
        telephone: u.telephone,
        photoProfil: u.photo_profil,
        typeUtilisateur: u.type_utilisateur,
        estActif: u.est_actif,
        estVerifie: u.est_verifie,
        dateInscription: u.date_inscription,
      })
    );
  } catch (error) {
    return handleError(error);
  }
}

export const GET = withAuth(handler);
