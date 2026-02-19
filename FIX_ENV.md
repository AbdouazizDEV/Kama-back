# 🔧 Résolution des Problèmes - Configuration Environnement

## ❌ Problème 1: `Environment variable not found: DATABASE_URL`

**Erreur:**
```
Error: Prisma schema validation
error: Environment variable not found: DATABASE_URL.
```

**Solution:**

### Étape 1: Vérifier que `.env.local` existe

```bash
ls -la .env.local
```

Si le fichier n'existe pas, créez-le :

```bash
cp .env.example .env.local
```

### Étape 2: Configurer `.env.local` avec vos valeurs Supabase

1. **Récupérer les clés Supabase:**
   - Allez sur [supabase.com](https://supabase.com)
   - Sélectionnez votre projet
   - **Settings** > **API** :
     - Copiez `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
     - Copiez `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - Copiez `service_role` → `SUPABASE_SERVICE_ROLE_KEY`

2. **Récupérer l'URL de la base de données:**
   - **Settings** > **Database**
   - Sous **Connection string**, sélectionnez **URI**
   - Copiez la chaîne
   - Remplacez `[YOUR-PASSWORD]` par votre mot de passe de base de données
   - Ajoutez-la comme `DATABASE_URL`

3. **Générer un JWT_SECRET:**
   ```bash
   openssl rand -base64 32
   ```
   Ou utilisez un générateur en ligne

### Étape 3: Vérifier la configuration

```bash
# Installer dotenv si nécessaire
npm install

# Vérifier les variables d'environnement
npm run env:check
```

Vous devriez voir toutes les variables marquées ✅

### Étape 4: Relancer Prisma

```bash
npx prisma migrate dev --name init
```

---

## ⚠️ Problème 2: Avertissement Next.js `experimental.serverActions`

**Avertissement:**
```
⚠ Invalid next.config.js options detected: 
⚠     Expected object, received boolean at "experimental.serverActions"
```

**Solution:** ✅ **DÉJÀ CORRIGÉ**

L'option obsolète a été supprimée de `next.config.js`. Redémarrez le serveur :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez
npm run dev
```

---

## ✅ Vérification Complète

Une fois tout configuré, testez :

### 1. Vérifier les variables d'environnement
```bash
npm run env:check
```

### 2. Créer les tables
```bash
npx prisma migrate dev --name init
```

### 3. Tester la connexion
```bash
# Terminal 1
npm run dev

# Terminal 2
curl http://localhost:3000/api/test-db
```

---

## 📝 Exemple de `.env.local` complet

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY0NTk5ODc2MCwiZXhwIjoxOTYxNTc0NzYwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjQ1OTk4NzYwLCJleHAiOjE5NjE1NzQ3NjB9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy

# Database
DATABASE_URL=postgresql://postgres.abcdefghijklmnop:VOTRE_MOT_DE_PASSE@aws-0-eu-central-1.pooler.supabase.com:6543/postgres

# JWT
JWT_SECRET=votre_clé_secrète_très_longue_et_aléatoire_ici_minimum_32_caractères
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# App
NODE_ENV=development
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3001
```

---

## 🆘 Besoin d'aide ?

Si vous avez toujours des problèmes :

1. Vérifiez que `.env.local` existe et contient toutes les variables
2. Vérifiez qu'il n'y a pas d'espaces avant/après les valeurs
3. Vérifiez que les guillemets ne sont pas nécessaires (sauf si la valeur contient des espaces)
4. Relancez le terminal après modification de `.env.local`
5. Utilisez `npm run env:check` pour diagnostiquer
