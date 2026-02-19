-- Script pour corriger les avertissements de sécurité Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Corriger la fonction check_table_exists
CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = check_table_exists.table_name
    );
END;
$$;

-- 2. Corriger la fonction increment_annonce_views
CREATE OR REPLACE FUNCTION increment_annonce_views(annonce_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE annonces 
    SET nombre_vues = nombre_vues + 1 
    WHERE id = annonce_id;
END;
$$;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Fonctions corrigées avec search_path sécurisé ✓';
END $$;
