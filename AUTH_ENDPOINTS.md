# 🔐 Endpoints d'Authentification - Kama Backend

## ✅ Tous les endpoints sont créés et utilisent Supabase Auth

### 📋 Liste des Endpoints

1. **POST /api/auth/register** - Créer un nouveau compte
2. **POST /api/auth/verify-email** - Vérifier l'email via token
3. **POST /api/auth/resend-verification** - Renvoyer l'email de vérification
4. **POST /api/auth/login** - Se connecter
5. **POST /api/auth/logout** - Se déconnecter
6. **POST /api/auth/refresh-token** - Rafraîchir le token
7. **POST /api/auth/forgot-password** - Demander réinitialisation
8. **POST /api/auth/reset-password** - Réinitialiser le mot de passe
9. **GET /api/auth/me** - Informations utilisateur connecté
10. **GET /api/auth/check** - Vérifier si le token est valide

## 🧪 Tester avec Swagger

### Option 1: Interface Swagger UI

1. Démarrer le serveur :
```bash
npm run dev
```

2. Accéder à la documentation :
```
http://localhost:3000/api-docs
```

### Option 2: Endpoint JSON Swagger

```
GET http://localhost:3000/api/swagger
```

## 📝 Exemples de Requêtes

### 1. Inscription

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "SecureP@ssw0rd123",
    "nom": "Dupont",
    "prenom": "Jean",
    "telephone": "+241062345678",
    "typeUtilisateur": "LOCATAIRE"
  }'
```

### 2. Connexion

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jean.dupont@example.com",
    "password": "SecureP@ssw0rd123"
  }'
```

### 3. Vérifier le token

```bash
curl -X GET http://localhost:3000/api/auth/check \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 4. Obtenir mes informations

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🔧 Configuration Supabase

### Important : Configuration Email dans Supabase

1. Allez dans **Supabase Dashboard** > **Authentication** > **Email Templates**
2. Configurez les templates d'email :
   - **Confirm signup** - Pour la vérification d'email
   - **Reset password** - Pour la réinitialisation

3. Configurez les **Redirect URLs** dans **Authentication** > **URL Configuration** :
   - Site URL: `http://localhost:3001` (votre frontend)
   - Redirect URLs: 
     - `http://localhost:3001/auth/verify-email`
     - `http://localhost:3001/auth/reset-password`

## ⚠️ Notes Importantes

1. **Supabase Auth gère automatiquement** :
   - L'envoi des emails de vérification
   - L'envoi des emails de réinitialisation
   - La validation des tokens
   - La gestion des sessions

2. **Notre table `users`** est synchronisée avec Supabase Auth :
   - Création automatique lors de l'inscription
   - Mise à jour du statut de vérification

3. **Tokens** :
   - Les tokens sont gérés par Supabase
   - Format JWT standard
   - Expiration automatique

## 🐛 Dépannage

### Erreur: "Email already registered"
- L'utilisateur existe déjà dans Supabase Auth
- Solution: Utiliser `/auth/login` ou `/auth/resend-verification`

### Erreur: "Invalid login credentials"
- Email ou mot de passe incorrect
- Vérifier les identifiants

### Erreur: "Email not verified"
- L'utilisateur doit vérifier son email
- Utiliser `/auth/resend-verification` pour renvoyer l'email

### Erreur: "Token invalid or expired"
- Le token a expiré
- Utiliser `/auth/refresh-token` pour obtenir un nouveau token
