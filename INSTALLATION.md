# Guide d'Installation - LocaGabon Backend

## 📋 Prérequis

- Node.js 18+ installé
- npm ou yarn
- Compte Supabase créé
- PostgreSQL (via Supabase)

## 🚀 Installation

### 1. Installer les dépendances

```bash
npm install
```

### 2. Configurer les variables d'environnement

Copiez `.env.example` vers `.env.local` et remplissez les valeurs :

```bash
cp .env.example .env.local
```

Éditez `.env.local` avec vos valeurs :
- `NEXT_PUBLIC_SUPABASE_URL` : URL de votre projet Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Clé anonyme Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service role Supabase
- `DATABASE_URL` : URL de connexion PostgreSQL
- `JWT_SECRET` : Clé secrète pour JWT (générez une clé aléatoire)

### 3. Configurer Prisma

Générez le client Prisma :

```bash
npx prisma generate
```

Créez et appliquez les migrations :

```bash
npx prisma migrate dev --name init
```

### 4. Générer les types Supabase (optionnel)

```bash
npx supabase gen types typescript --project-id "your-project-id" > src/shared/types/supabase.types.ts
```

### 5. Lancer le serveur de développement

```bash
npm run dev
```

Le serveur sera accessible sur `http://localhost:3000`

## 📚 Endpoints Disponibles

- `GET /api/health` - Vérification de santé
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `GET /api/auth/me` - Informations utilisateur connecté
- `GET /api/swagger` - Documentation Swagger (JSON)

## 🧪 Tests

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## 🔧 Commandes Utiles

```bash
# Développement
npm run dev

# Build production
npm run build
npm run start

# Linting & Formatting
npm run lint
npm run format

# Prisma
npx prisma generate
npx prisma migrate dev
npx prisma studio

# Supabase types
npx supabase gen types typescript --project-id "your-id" > src/shared/types/supabase.types.ts
```

## ⚠️ Notes Importantes

1. **Sécurité** : Ne commitez JAMAIS le fichier `.env.local`
2. **JWT_SECRET** : Utilisez une clé forte et aléatoire en production
3. **Database** : Assurez-vous que votre base de données PostgreSQL est accessible
4. **Supabase** : Configurez correctement les RLS (Row Level Security) dans Supabase

## 🐛 Dépannage

### Erreur "process is not defined"
Installez les types Node.js :
```bash
npm install --save-dev @types/node
```

### Erreur de connexion à la base de données
Vérifiez que `DATABASE_URL` est correcte et que la base est accessible.

### Erreur Supabase
Vérifiez que les clés Supabase sont correctes dans `.env.local`.
