-- Script de configuration initiale pour Supabase
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Créer les tables selon le schéma Prisma
-- (Les migrations Prisma créeront les tables, mais voici un script de référence)

-- Table Users (sera créée par Prisma)
-- Vérifier que la table existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        RAISE NOTICE 'Table users n''existe pas encore. Exécutez: npx prisma migrate dev';
    ELSE
        RAISE NOTICE 'Table users existe ✓';
    END IF;
END $$;

-- 2. Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. Fonction pour vérifier l'existence d'une table (pour les tests)
CREATE OR REPLACE FUNCTION check_table_exists(table_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = check_table_exists.table_name
    );
END;
$$ LANGUAGE plpgsql;

-- 4. Créer un bucket de stockage pour les uploads
-- (À faire via l'interface Supabase ou l'API)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('uploads', 'uploads', true)
-- ON CONFLICT (id) DO NOTHING;

-- 5. Politiques RLS (Row Level Security) - Exemple basique
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique pour que les utilisateurs voient seulement leurs propres données
-- CREATE POLICY "Users can view own data" ON users
--     FOR SELECT USING (auth.uid() = id);

-- 6. Index pour améliorer les performances
-- CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
-- CREATE INDEX IF NOT EXISTS idx_users_type ON users(type_utilisateur);
-- CREATE INDEX IF NOT EXISTS idx_annonces_proprietaire ON annonces(proprietaire_id);
-- CREATE INDEX IF NOT EXISTS idx_annonces_ville ON annonces(ville);
-- CREATE INDEX IF NOT EXISTS idx_reservations_locataire ON reservations(locataire_id);
-- CREATE INDEX IF NOT EXISTS idx_reservations_proprietaire ON reservations(proprietaire_id);

-- 7. Fonction pour incrémenter les vues d'une annonce
CREATE OR REPLACE FUNCTION increment_annonce_views(annonce_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE annonces 
    SET nombre_vues = nombre_vues + 1 
    WHERE id = annonce_id;
END;
$$ LANGUAGE plpgsql;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Script de configuration Supabase exécuté avec succès!';
    RAISE NOTICE 'Prochaines étapes:';
    RAISE NOTICE '1. Exécutez: npx prisma migrate dev';
    RAISE NOTICE '2. Testez la connexion: GET /api/test-db';
END $$;
