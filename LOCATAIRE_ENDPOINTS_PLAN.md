# 📋 Plan d'implémentation des endpoints Locataire

## ✅ Structure de base créée

- ✅ `IMessageRepository` - Interface pour les messages
- ✅ `IFavoriRepository` - Interface pour les favoris
- ✅ `Favori.entity` - Entité Favori
- ✅ `locataire.validator.ts` - Validators Zod
- ✅ `GetProfil.usecase.ts` - Use case pour récupérer le profil
- ✅ `UpdateProfil.usecase.ts` - Use case pour mettre à jour le profil
- ✅ `GET /api/locataire/profil` - Consulter le profil
- ✅ `PUT /api/locataire/profil` - Modifier le profil

## 📝 Endpoints à implémenter (28 restants)

### 1. Gestion du profil (5 endpoints restants)

- [ ] `POST /api/locataire/profil/photo` - Uploader/modifier photo de profil
- [ ] `DELETE /api/locataire/profil/photo` - Supprimer photo de profil
- [ ] `POST /api/locataire/profil/documents` - Uploader documents KYC
- [ ] `GET /api/locataire/profil/score` - Consulter score de confiance
- [ ] `GET /api/locataire/profil/historique` - Consulter historique de locations

### 2. Recherche d'annonces (3 endpoints)

- [ ] `GET /api/locataire/annonces` - Rechercher avec filtres avancés
- [ ] `GET /api/locataire/annonces/{id}` - Consulter détail d'une annonce
- [ ] `GET /api/locataire/annonces/recommandations` - Recommandations personnalisées

### 3. Gestion des favoris (4 endpoints)

- [ ] `GET /api/locataire/favoris` - Lister mes favoris
- [ ] `POST /api/locataire/favoris` - Ajouter aux favoris
- [ ] `DELETE /api/locataire/favoris/{annonceId}` - Retirer des favoris
- [ ] `GET /api/locataire/favoris/export` - Exporter en PDF

### 4. Réservations (6 endpoints)

- [ ] `GET /api/locataire/reservations` - Lister mes réservations
- [ ] `GET /api/locataire/reservations/{id}` - Consulter détail
- [ ] `POST /api/locataire/reservations` - Créer une réservation
- [ ] `PUT /api/locataire/reservations/{id}/annuler` - Annuler
- [ ] `GET /api/locataire/reservations/{id}/contrat` - Télécharger contrat PDF
- [ ] `POST /api/locataire/reservations/{id}/signer` - Signer électroniquement

### 5. Paiements (6 endpoints)

- [ ] `GET /api/locataire/paiements` - Historique des paiements
- [ ] `GET /api/locataire/paiements/{id}` - Détail d'un paiement
- [ ] `POST /api/locataire/paiements` - Initier un paiement
- [ ] `POST /api/locataire/paiements/{id}/preuve` - Uploader preuve de paiement
- [ ] `GET /api/locataire/paiements/{id}/quittance` - Télécharger quittance PDF
- [ ] `POST /api/locataire/paiements/caution/remboursement` - Demander remboursement

### 6. Messagerie (5 endpoints)

- [ ] `GET /api/locataire/messages` - Lister conversations
- [ ] `GET /api/locataire/messages/{conversationId}` - Consulter conversation
- [ ] `POST /api/locataire/messages` - Envoyer un message
- [ ] `GET /api/locataire/messages/non-lus` - Compter messages non lus
- [ ] `PUT /api/locataire/messages/{messageId}/lu` - Marquer comme lu

### 7. Avis (4 endpoints)

- [ ] `POST /api/locataire/avis` - Laisser un avis
- [ ] `GET /api/locataire/avis` - Consulter mes avis
- [ ] `PUT /api/locataire/avis/{id}` - Modifier un avis
- [ ] `DELETE /api/locataire/avis/{id}` - Supprimer un avis

## 🏗️ Architecture à suivre

Pour chaque endpoint, créer :

1. **Use Case** (`src/core/use-cases/locataire/`)
   - Logique métier
   - Validation
   - Appels aux repositories

2. **Route Handler** (`src/app/api/locataire/`)
   - Authentification (withAuth)
   - Validation (validateRequest/validateQuery)
   - Appel au use case
   - Documentation Swagger

3. **Repository** (si nécessaire)
   - Implémentation dans `src/infrastructure/database/repositories/`

4. **Validator** (si nécessaire)
   - Ajout dans `src/presentation/validators/locataire.validator.ts`

## 📚 Exemple de structure

```
src/
├── core/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Favori.entity.ts ✅
│   │   └── repositories/
│   │       ├── IFavoriRepository.ts ✅
│   │       └── IMessageRepository.ts ✅
│   └── use-cases/
│       └── locataire/
│           ├── GetProfil.usecase.ts ✅
│           ├── UpdateProfil.usecase.ts ✅
│           └── [autres use cases]
├── infrastructure/
│   └── database/
│       └── repositories/
│           └── [implémentations]
└── app/
    └── api/
        └── locataire/
            ├── profil/
            │   └── route.ts ✅
            └── [autres routes]
```

## 🔐 Sécurité

- Tous les endpoints doivent utiliser `withAuth`
- Vérifier que `req.user.typeUtilisateur === 'LOCATAIRE'`
- Valider toutes les entrées avec Zod
- Gérer les erreurs avec `handleError`

## 📖 Documentation Swagger

Chaque endpoint doit avoir :
- `@swagger` comment avec description complète
- Tags: `[Locataire]`
- Security: `bearerAuth: []`
- Request/Response schemas
