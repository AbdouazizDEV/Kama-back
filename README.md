# LocaGabon Backend

Backend de la plateforme de location multi-catégories LocaGabon au Gabon.

## 🚀 Stack Technique

- **Next.js 14** (App Router avec Route Handlers)
- **Supabase** (PostgreSQL, Auth, Storage, Realtime, Edge Functions)
- **TypeScript** (strict mode)
- **Prisma ORM** (pour typage et migrations)
- **Swagger/OpenAPI 3.0** (documentation API complète)

## 📋 Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase
- PostgreSQL (via Supabase)

## 🛠️ Installation

1. Cloner le projet
2. Installer les dépendances :
```bash
npm install
```

3. Configurer les variables d'environnement :
```bash
cp .env.example .env.local
# Éditer .env.local avec vos valeurs
```

4. Configurer Prisma :
```bash
npx prisma generate
npx prisma migrate dev
```

5. Lancer le serveur de développement :
```bash
npm run dev
```

## 📁 Architecture

Le projet suit une **architecture hexagonale (Ports & Adapters)** avec les principes **SOLID** :

- **Domain Layer** : Entités, Value Objects, Interfaces (Ports)
- **Use Cases** : Logique métier
- **Infrastructure Layer** : Implémentations concrètes (Adapters)
- **Presentation Layer** : Controllers, Middlewares, DTOs

## 🧪 Tests

```bash
npm run test
npm run test:watch
npm run test:coverage
```

## 📚 Documentation API

La documentation Swagger est disponible à :
- `/api/swagger` (JSON)
- `/api-docs` (Interface Swagger UI)

## 🔒 Sécurité

- Authentification JWT
- Validation des données (Zod)
- Rate limiting
- CORS configuré
- Protection OWASP Top 10

## 📝 Scripts Disponibles

- `npm run dev` - Développement
- `npm run build` - Build production
- `npm run start` - Démarrer en production
- `npm run lint` - Linter
- `npm run format` - Formatter
- `npm run test` - Tests
- `npm run prisma:generate` - Générer Prisma Client
- `npm run prisma:migrate` - Migrations
- `npm run prisma:studio` - Prisma Studio

## 🏗️ Principes SOLID

- **S** - Single Responsibility
- **O** - Open/Closed
- **L** - Liskov Substitution
- **I** - Interface Segregation
- **D** - Dependency Inversion
