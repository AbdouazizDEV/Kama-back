# Variables d'environnement requises

## 📋 Variables obligatoires

Ces variables doivent être configurées dans Vercel pour que l'application fonctionne :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=votre_secret_jwt_aleatoire_et_long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d
```

## 🔧 Variables optionnelles

```env
# Application
NODE_ENV=production
API_URL=https://votre-projet.vercel.app
FRONTEND_URL=https://votre-frontend.com

# Email (SendGrid)
SENDGRID_API_KEY=votre_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@kama.com
SUPPORT_EMAIL=support@kama.com

# Payment Gateways
AIRTEL_MONEY_API_KEY=votre_airtel_money_key
MOOV_MONEY_API_KEY=votre_moov_money_key
STRIPE_SECRET_KEY=votre_stripe_secret_key
```

## 📝 Instructions pour Vercel

1. Aller dans **Settings** > **Environment Variables**
2. Ajouter chaque variable une par une
3. Sélectionner les environnements (Production, Preview, Development)
4. Sauvegarder et redéployer

## ⚠️ Notes importantes

- `NEXT_PUBLIC_*` : Variables accessibles côté client (ne pas mettre de secrets)
- `SUPABASE_SERVICE_ROLE_KEY` : Secret, ne jamais exposer côté client
- `JWT_SECRET` : Doit être long et aléatoire (minimum 32 caractères)
- `DATABASE_URL` : Format PostgreSQL complet avec credentials
