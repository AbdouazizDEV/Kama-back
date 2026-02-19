# Configuration Supabase - Kama Backend

## 📋 Prérequis

1. Compte Supabase créé
2. Projet Supabase créé
3. Variables d'environnement configurées dans `.env.local`

## 🔧 Configuration étape par étape

### 1. Récupérer les clés Supabase

1. Allez sur [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY`

### 2. Configurer les variables d'environnement

Éditez `.env.local` :

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres
```

### 3. Récupérer l'URL de la base de données

1. Dans Supabase, allez dans **Settings** > **Database**
2. Copiez la **Connection string** (URI)
3. Remplacez `[PASSWORD]` par votre mot de passe de base de données
4. Ajoutez-la dans `.env.local` comme `DATABASE_URL`

### 4. Créer les tables avec Prisma

```bash
# Générer le client Prisma
npx prisma generate

# Créer et appliquer les migrations
npx prisma migrate dev --name init

# (Optionnel) Ouvrir Prisma Studio pour visualiser les données
npx prisma studio
```

### 5. Configurer Supabase (SQL)

1. Allez dans **SQL Editor** dans Supabase
2. Exécutez le script `scripts/setup-supabase.sql`
3. Ou copiez-collez le contenu du fichier

### 6. Configurer le Storage (optionnel pour l'instant)

1. Allez dans **Storage** dans Supabase
2. Créez un bucket nommé `uploads`
3. Rendez-le public si nécessaire

### 7. Tester la connexion

#### Option 1: Via l'endpoint API

```bash
# Démarrer le serveur
npm run dev

# Tester dans un autre terminal
curl http://localhost:3000/api/test-db
```

#### Option 2: Via le script Node.js

```bash
npx ts-node scripts/check-db-connection.ts
```

## ✅ Vérification

Si tout est correct, vous devriez voir :

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
      "variables": {
        "supabaseUrl": true,
        "supabaseAnonKey": true,
        "supabaseServiceKey": true,
        "databaseUrl": true
      }
    }
  }
}
```

## 🐛 Dépannage

### Erreur: "Table users does not exist"

**Solution:** Exécutez les migrations Prisma :
```bash
npx prisma migrate dev
```

### Erreur: "Invalid API key"

**Solution:** Vérifiez que vous avez copié les bonnes clés dans `.env.local`

### Erreur: "Connection refused"

**Solution:** 
1. Vérifiez que votre projet Supabase est actif
2. Vérifiez l'URL dans `NEXT_PUBLIC_SUPABASE_URL`
3. Vérifiez votre connexion internet

### Erreur: "Database connection failed"

**Solution:**
1. Vérifiez le `DATABASE_URL` dans `.env.local`
2. Vérifiez que le mot de passe est correct
3. Vérifiez que la base de données est accessible depuis votre IP (Settings > Database > Connection pooling)

## 📚 Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Prisma](https://www.prisma.io/docs)
- [Guide de migration Prisma](https://www.prisma.io/docs/guides/migrate-to-prisma)
