# Guide de déploiement sur Vercel

## 📋 Prérequis

1. Compte Vercel (gratuit ou payant)
2. Repository GitHub connecté
3. Variables d'environnement configurées

## 🚀 Déploiement

### Option 1 : Via l'interface Vercel (Recommandé)

1. **Connecter le repository GitHub**
   - Aller sur [vercel.com](https://vercel.com)
   - Cliquer sur "New Project"
   - Importer le repository `AbdouazizDEV/Kama-back`

2. **Configuration du projet**
   - **Framework Preset**: Next.js (détecté automatiquement)
   - **Root Directory**: `./` (par défaut)
   - **Build Command**: `npm run build` (par défaut)
   - **Output Directory**: `.next` (par défaut)
   - **Install Command**: `npm install` (par défaut)

3. **Variables d'environnement**
   Ajouter toutes les variables suivantes dans Vercel :

   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
   SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

   # Database
   DATABASE_URL=postgresql://user:password@host:port/database

   # JWT
   JWT_SECRET=votre_secret_jwt_aleatoire
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_EXPIRES_IN=30d

   # App
   NODE_ENV=production
   API_URL=https://votre-projet.vercel.app
   FRONTEND_URL=https://votre-frontend.com

   # Email (Optionnel)
   SENDGRID_API_KEY=votre_sendgrid_key
   SENDGRID_FROM_EMAIL=noreply@kama.com
   SUPPORT_EMAIL=support@kama.com

   # Payment (Optionnel)
   AIRTEL_MONEY_API_KEY=votre_key
   MOOV_MONEY_API_KEY=votre_key
   STRIPE_SECRET_KEY=votre_key
   ```

4. **Déployer**
   - Cliquer sur "Deploy"
   - Attendre la fin du build
   - Votre application sera disponible à `https://votre-projet.vercel.app`

### Option 2 : Via Vercel CLI

1. **Installer Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Se connecter**
   ```bash
   vercel login
   ```

3. **Déployer**
   ```bash
   vercel
   ```

4. **Configurer les variables d'environnement**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   # ... etc pour toutes les variables
   ```

5. **Déployer en production**
   ```bash
   vercel --prod
   ```

## 🔧 Configuration Post-Déploiement

### 1. Migrations Prisma

Les migrations Prisma doivent être exécutées manuellement ou via un script de build :

```bash
# Dans Vercel, ajouter dans Build Command :
npm run prisma:generate && npm run build
```

Ou créer un script de post-deploy dans Vercel.

### 2. Documentation Swagger

Une fois déployé, la documentation Swagger sera disponible à :
- **Swagger UI**: `https://votre-projet.vercel.app/api-docs`
- **JSON OpenAPI**: `https://votre-projet.vercel.app/api/swagger`

### 3. Vérification

1. Tester l'endpoint de santé : `GET /api/health` (si disponible)
2. Tester la documentation : `GET /api-docs`
3. Tester un endpoint public : `GET /api/public/annonces`

## 📝 Notes importantes

- **Prisma Generate**: Vercel génère automatiquement Prisma Client lors du build
- **Migrations**: Les migrations doivent être appliquées manuellement sur la base de données de production
- **Variables d'environnement**: Ne jamais commiter les fichiers `.env.local`
- **Build Timeout**: Les builds peuvent prendre jusqu'à 30 secondes (configuré dans `vercel.json`)

## 🔍 Dépannage

### Erreur de build

1. Vérifier les logs dans Vercel Dashboard
2. Vérifier que toutes les variables d'environnement sont définies
3. Vérifier que `prisma generate` s'exécute correctement

### Erreur 500 en production

1. Vérifier les logs Vercel
2. Vérifier la connexion à Supabase
3. Vérifier que la base de données est accessible

### Documentation Swagger ne charge pas

1. Vérifier que `/api/swagger` retourne du JSON
2. Vérifier la console du navigateur pour les erreurs
3. Vérifier que `swagger-ui-react` est bien installé

## 🎯 URLs importantes

- **Application**: `https://votre-projet.vercel.app`
- **API Docs**: `https://votre-projet.vercel.app/api-docs`
- **Swagger JSON**: `https://votre-projet.vercel.app/api/swagger`
