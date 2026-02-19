// Types générés depuis Supabase
// Pour générer : npx supabase gen types typescript --project-id "your-project-id" > src/shared/types/supabase.types.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          password: string;
          nom: string;
          prenom: string;
          telephone: string;
          photo_profil: string | null;
          type_utilisateur: string;
          est_actif: boolean;
          est_verifie: boolean;
          date_inscription: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password: string;
          nom: string;
          prenom: string;
          telephone: string;
          photo_profil?: string | null;
          type_utilisateur: string;
          est_actif?: boolean;
          est_verifie?: boolean;
          date_inscription?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password?: string;
          nom?: string;
          prenom?: string;
          telephone?: string;
          photo_profil?: string | null;
          type_utilisateur?: string;
          est_actif?: boolean;
          est_verifie?: boolean;
          date_inscription?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      // Ajouter d'autres tables selon le schéma Prisma
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
