import { supabase, supabaseAdmin } from '@/config/supabase.config';
import type { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';

export interface AuthResponse {
  user: SupabaseUser | null;
  session: Session | null;
  error: AuthError | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
  typeUtilisateur: 'LOCATAIRE' | 'PROPRIETAIRE' | 'ETUDIANT';
}

export interface LoginInput {
  email: string;
  password: string;
}

export class SupabaseAuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async signUp(input: RegisterInput): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          nom: input.nom,
          prenom: input.prenom,
          telephone: input.telephone,
          type_utilisateur: input.typeUtilisateur,
        },
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/verify-email`,
      },
    });

    return {
      user: data.user,
      session: data.session,
      error: error,
    };
  }

  /**
   * Connexion avec email et mot de passe
   */
  async signIn(input: LoginInput): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });

    return {
      user: data.user,
      session: data.session,
      error: error,
    };
  }

  /**
   * Vérification de l'email avec un token OTP
   */
  async verifyEmail(token: string, type: 'email' | 'signup' | 'recovery' = 'signup'): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type,
    });

    return {
      user: data.user,
      session: data.session,
      error: error,
    };
  }

  /**
   * Renvoyer l'email de vérification
   */
  async resendVerificationEmail(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/verify-email`,
      },
    });

    return { error };
  }

  /**
   * Déconnexion
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.signOut();
    return { error };
  }

  /**
   * Demander la réinitialisation du mot de passe
   */
  async resetPasswordForEmail(email: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/auth/reset-password`,
    });

    return { error };
  }

  /**
   * Réinitialiser le mot de passe avec un token
   */
  async updatePassword(newPassword: string): Promise<{ error: AuthError | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    return { error };
  }

  /**
   * Rafraîchir la session
   */
  async refreshSession(refreshToken: string): Promise<AuthResponse> {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    return {
      user: data.user,
      session: data.session,
      error: error,
    };
  }

  /**
   * Obtenir la session actuelle
   */
  async getSession(): Promise<{ session: Session | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getSession();
    return {
      session: data.session,
      error: error,
    };
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  async getUser(): Promise<{ user: SupabaseUser | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getUser();
    return {
      user: data.user,
      error: error,
    };
  }

  /**
   * Vérifier un token d'accès
   */
  async verifyAccessToken(accessToken: string): Promise<{ user: SupabaseUser | null; error: AuthError | null }> {
    const { data, error } = await supabase.auth.getUser(accessToken);
    return {
      user: data.user,
      error: error,
    };
  }

  /**
   * Créer un utilisateur dans la table users (après inscription Supabase Auth)
   */
  async createUserInDatabase(
    supabaseUserId: string,
    email: string,
    nom: string,
    prenom: string,
    telephone: string,
    typeUtilisateur: string
  ): Promise<void> {
    const { error } = await supabaseAdmin.from('users').insert({
      id: supabaseUserId,
      email: email.toLowerCase().trim(),
      nom,
      prenom,
      telephone,
      type_utilisateur: typeUtilisateur,
      est_actif: true,
      est_verifie: false,
      date_inscription: new Date().toISOString(),
    });

    if (error) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${error.message}`);
    }
  }

  /**
   * Mettre à jour le statut de vérification de l'utilisateur
   */
  async updateUserVerificationStatus(userId: string, verified: boolean): Promise<void> {
    const { error } = await supabaseAdmin
      .from('users')
      .update({ est_verifie: verified })
      .eq('id', userId);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
    }
  }
}
