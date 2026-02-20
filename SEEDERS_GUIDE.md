# 🌱 Guide des Seeders - Kama Backend

## 📋 Vue d'ensemble

Les seeders permettent de peupler la base de données avec des données de test réalistes pour le Gabon.

## 🚀 Utilisation

### Exécuter les seeders

```bash
npm run db:seed
```

Ou directement :

```bash
npm run prisma:seed
```

## 📊 Données créées

### Utilisateurs (9 utilisateurs)

1. **Admin** (1)
   - Email: `admin@kama.ga`
   - Type: ADMIN

2. **Propriétaires** (3)
   - `jean.dupont@example.com`
   - `marie.martin@example.com`
   - `pierre.bernard@example.com`

3. **Locataires** (3)
   - `sophie.durand@example.com`
   - `paul.leroy@example.com`
   - `lucie.moreau@example.com`

4. **Étudiants** (2)
   - `thomas.petit@example.com`
   - `emma.robert@example.com`

**Mot de passe pour tous :** `Password123!`

### Annonces (20 annonces)

- **Types de biens :**
  - APPARTEMENT (Studios, T2, T3, T4, T5+)
  - MAISON (Villas, Maisons traditionnelles/modernes)
  - TERRAIN (Constructible, agricole, commercial)
  - VEHICULE (Voitures, Motos, Vélos, Camions)

- **Villes du Gabon :**
  - Libreville (15 quartiers)
  - Port-Gentil (10 quartiers)
  - Franceville (5 quartiers)
  - Oyem (3 quartiers)
  - Moanda (2 quartiers)

- **Prix :**
  - Appartements: 50 000 - 250 000 FCFA/mois
  - Maisons: 100 000 - 600 000 FCFA/mois
  - Terrains: 500 000 - 10 500 000 FCFA
  - Véhicules: 50 000 - 550 000 FCFA/mois

- **Équipements :**
  - Climatisation, Électricité, Eau courante
  - Internet, Parking, Jardin
  - Piscine, Sécurité, Meublé, Cuisine équipée

### Réservations (8 réservations)

- Statuts variés : EN_ATTENTE, ACCEPTEE, REJETEE, TERMINEE
- Dates de début/fin aléatoires
- Prix calculés selon la durée

### Favoris (10 favoris)

- Associations aléatoires entre locataires/étudiants et annonces

## 🔄 Réinitialiser les données

Les seeders **nettoyent automatiquement** la base de données avant d'insérer les nouvelles données.

⚠️ **Attention :** Toutes les données existantes seront supprimées !

Ordre de suppression :
1. Favoris
2. Messages
3. Paiements
4. Réservations
5. Annonces
6. Users

## 🛠️ Personnalisation

### Modifier les données

Éditez le fichier `prisma/seed.ts` pour :
- Ajouter plus d'utilisateurs
- Modifier les villes/quartiers
- Ajuster les prix
- Changer les types de biens

### Ajouter des villes/quartiers

```typescript
const villesGabon = [
  {
    ville: 'VotreVille',
    quartiers: ['Quartier1', 'Quartier2', 'Quartier3'],
  },
  // ...
];
```

### Modifier les prix

```typescript
if (typeBien === 'APPARTEMENT') {
  prix = Math.floor(Math.random() * 200000) + 50000; // Modifier ici
  // ...
}
```

## 📝 Exemples d'utilisation

### Après le seeding

```bash
# Voir les données dans Prisma Studio
npm run prisma:studio
```

### Tester avec les comptes créés

```bash
# Se connecter avec un compte propriétaire
curl -X POST 'http://localhost:3000/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "Password123!"
  }'
```

### Lister les annonces

```bash
# Endpoint à créer : GET /api/annonces
# Utiliser les IDs des annonces créées
```

## 🐛 Dépannage

### Erreur: "Cannot find module '@prisma/client'"

```bash
npm run prisma:generate
```

### Erreur: "Environment variable not found: DATABASE_URL"

Vérifiez que `.env.local` est configuré :

```bash
npm run env:check
```

### Erreur: "Unique constraint failed"

Les seeders nettoient la base avant d'insérer. Si l'erreur persiste :

```bash
# Nettoyer manuellement
npx prisma migrate reset
npm run db:seed
```

## 📚 Structure des données

### User
- ID, Email, Password (hashé)
- Nom, Prénom, Téléphone
- Type utilisateur (ADMIN, PROPRIETAIRE, LOCATAIRE, ETUDIANT)
- Statuts (actif, vérifié)

### Annonce
- Propriétaire (relation)
- Titre, Description
- Type et catégorie de bien
- Prix, Caution
- Localisation (ville, quartier, adresse)
- Coordonnées GPS (latitude, longitude)
- Caractéristiques (superficie, nombre de pièces)
- Équipements (tableau)
- Photos (tableau)
- Disponibilité et statut de modération

### Reservation
- Annonce, Locataire, Propriétaire (relations)
- Dates (début, fin)
- Nombre de personnes
- Prix total, Caution
- Message
- Statut

### Favori
- User, Annonce (relation unique)

## ✅ Checklist après seeding

- [ ] Vérifier que les utilisateurs sont créés
- [ ] Vérifier que les annonces sont créées
- [ ] Vérifier que les réservations sont créées
- [ ] Tester la connexion avec un compte
- [ ] Vérifier les relations (propriétaire → annonces)

## 🎯 Prochaines étapes

1. Créer les endpoints pour lister les annonces
2. Créer les endpoints pour gérer les réservations
3. Créer les endpoints pour gérer les favoris
4. Ajouter plus de données si nécessaire
