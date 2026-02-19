# 🚀 Guide de Démarrage Rapide - Kama Backend

## ✅ Étape 1: Premier Commit Git (FAIT ✓)

Le projet a été initialisé et poussé vers GitHub :
- Repository: `git@github.com:AbdouazizDEV/Kama-back.git`
- Branche: `main`
- 2 commits effectués

## 📦 Étape 2: Installer les dépendances

```bash
npm install
```

## 🔐 Étape 3: Configurer Supabase

### 3.1 Créer un projet Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Créez un nouveau projet
3. Notez le nom de votre projet

### 3.2 Récupérer les clés API

1. Dans Supabase, allez dans **Settings** > **API**
2. Copiez les valeurs suivantes :

```env
# Project URL
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co

# anon public key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# service_role key (⚠️ SECRET - ne jamais exposer côté client)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 3.3 Récupérer l'URL de la base de données

1. Dans Supabase, allez dans **Settings** > **Database**
2. Sous **Connection string**, sélectionnez **URI**
3. Copiez la chaîne de connexion
4. Remplacez `[YOUR-PASSWORD]` par votre mot de passe de base de données

Exemple :
```
postgresql://postgres.xxxxx:VOTRE_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

### 3.4 Configurer `.env.local`

Créez ou éditez `.env.local` :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Database
DATABASE_URL=postgresql://postgres.xxxxx:VOTRE_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# JWT
JWT_SECRET=votre_jwt_secret_aleatoire_et_long
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# App
NODE_ENV=development
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001

# Email (SendGrid - optionnel pour l'instant)
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=noreply@kama.com

# Payment (optionnel pour l'instant)
AIRTEL_MONEY_API_KEY=
MOOV_MONEY_API_KEY=
STRIPE_SECRET_KEY=
```

## 🗄️ Étape 4: Créer les tables dans Supabase

### 4.1 Générer le client Prisma

```bash
npx prisma generate
```

### 4.2 Créer les migrations

```bash
npx prisma migrate dev --name init
```

Cette commande va :
- Créer les tables dans votre base Supabase
- Générer les migrations Prisma
- Synchroniser le schéma

### 4.3 (Optionnel) Configurer Supabase avec le script SQL

1. Dans Supabase, allez dans **SQL Editor**
2. Copiez le contenu de `scripts/setup-supabase.sql`
3. Exécutez le script

## ✅ Étape 5: Tester la connexion

### Option 1: Via l'endpoint API (Recommandé)

```bash
# Terminal 1: Démarrer le serveur
npm run dev

# Terminal 2: Tester la connexion
curl http://localhost:3000/api/test-db
```

Vous devriez voir :
```json
{
  "success": true,
  "data": {
    "status": "connected",
    "database": {
      "connected": true,
      "tableExists": true,
      "userCount": 0
    },
    "environment": {
      "configured": true,
      ...
    }
  }
}
```

### Option 2: Via le script Node.js

```bash
npm run db:check
```

## 🎯 Prochaines étapes

Une fois la connexion vérifiée :

1. ✅ **Base de données configurée**
2. 📝 **Créer les endpoints d'authentification** (déjà créés, à tester)
3. 🏠 **Créer les endpoints pour les annonces**
4. 📅 **Créer les endpoints pour les réservations**
5. 💰 **Créer les endpoints pour les paiements**

## 🐛 Problèmes courants

### Erreur: "Table users does not exist"

**Solution:**
```bash
npx prisma migrate dev
```

### Erreur: "Invalid API key"

**Solution:** Vérifiez que vous avez copié les bonnes clés dans `.env.local`

### Erreur: "Connection refused"

**Solution:** 
- Vérifiez que votre projet Supabase est actif
- Vérifiez l'URL dans `NEXT_PUBLIC_SUPABASE_URL`
- Vérifiez votre connexion internet

### Erreur: "Database connection failed"

**Solution:**
- Vérifiez le `DATABASE_URL` dans `.env.local`
- Vérifiez que le mot de passe est correct
- Vérifiez que la base de données est accessible (Settings > Database > Connection pooling)

## 📚 Documentation

- [Guide complet Supabase](./SUPABASE_SETUP.md)
- [Guide d'installation](./INSTALLATION.md)
- [Documentation API Swagger](./src/docs/swagger/)

---

**Status:** ✅ Git configuré | ⏳ Supabase à configurer | ⏳ Connexion à tester
