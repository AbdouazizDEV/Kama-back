-- Script SQL pour créer la table newsletter_subscriptions
-- À exécuter dans l'éditeur SQL de Supabase

CREATE TABLE IF NOT EXISTS newsletter_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  date_inscription TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  est_actif BOOLEAN DEFAULT TRUE,
  date_desinscription TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_actif ON newsletter_subscriptions(est_actif);

-- Commentaires
COMMENT ON TABLE newsletter_subscriptions IS 'Table pour gérer les abonnements à la newsletter';
COMMENT ON COLUMN newsletter_subscriptions.email IS 'Email de l''abonné';
COMMENT ON COLUMN newsletter_subscriptions.est_actif IS 'Indique si l''abonnement est actif';
COMMENT ON COLUMN newsletter_subscriptions.date_desinscription IS 'Date de désinscription si l''utilisateur se désabonne';
