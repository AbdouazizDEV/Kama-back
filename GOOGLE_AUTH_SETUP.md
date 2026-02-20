# 🔐 Configuration de l'Authentification Google - Kama Backend

## 📋 Vue d'ensemble

L'authentification Google permet aux utilisateurs de se connecter avec leur compte Google, évitant ainsi les problèmes de livraison d'emails liés aux limitations de l'essai gratuit de Supabase.

## ✅ Avantages

- ✅ Pas besoin d'email de vérification
- ✅ Expérience utilisateur fluide
- ✅ Email automatiquement vérifié par Google
- ✅ Pas de limite d'envoi d'emails

## 🚀 Configuration dans Supabase

### Étape 1: Créer un Projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API **Google+ API** (ou **Google Identity Services**)

### Étape 2: Créer les Identifiants OAuth

1. Dans Google Cloud Console, allez dans **APIs & Services** > **Credentials**
2. Cliquez sur **Create Credentials** > **OAuth client ID**
3. Si c'est la première fois, configurez l'écran de consentement OAuth :
   - Type d'application : **Externe**
   - Nom de l'application : **Kama**
   - Email de support : votre email
   - Domaines autorisés : votre domaine (ex: `kama.com`)
4. Créez l'OAuth client ID :
   - Type d'application : **Web application**
   - Nom : **Kama Web Client**
   - **Authorized JavaScript origins** :
     ```
     https://hzeiyyzopquxmgxpuhpo.supabase.co
     http://localhost:3000 (pour le développement)
     ```
   - **Authorized redirect URIs** :
     ```
     https://hzeiyyzopquxmgxpuhpo.supabase.co/auth/v1/callback
     http://localhost:3000/auth/callback (pour le développement)
     ```
5. Copiez le **Client ID** et le **Client Secret**

### Étape 3: Configurer dans Supabase

1. Allez dans votre **Supabase Dashboard**
2. Naviguez vers **Authentication** > **Providers**
3. Cliquez sur **Google**
4. Activez le toggle **"Activer la connexion avec Google"**
5. Remplissez les champs :
   - **Identifiants clients** : Collez votre **Client ID** de Google
   - **Secret client (pour OAuth)** : Collez votre **Client Secret** de Google
6. (Optionnel) Activez **"Autoriser les utilisateurs sans e-mail"** si nécessaire
7. Cliquez sur **Enregistrer**

### Étape 4: Configurer les URLs de Redirection

Dans **Authentication** > **URL Configuration** :

- **Site URL** : `http://localhost:3001` (votre frontend)
- **Redirect URLs** : Ajoutez :
  ```
  http://localhost:3001/auth/callback
  https://votre-domaine.com/auth/callback
  ```

## 📡 Utilisation de l'API

### 1. Obtenir l'URL d'authentification Google

```bash
GET /api/auth/google?redirectTo=http://localhost:3001/auth/callback
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://hzeiyyzopquxmgxpuhpo.supabase.co/auth/v1/authorize?provider=google&..."
  },
  "message": "URL d'authentification Google générée"
}
```

### 2. Rediriger l'utilisateur

Dans votre frontend, redirigez l'utilisateur vers `authUrl` :

```javascript
// Frontend (React/Next.js)
const handleGoogleLogin = async () => {
  const response = await fetch('/api/auth/google?redirectTo=http://localhost:3001/auth/callback');
  const data = await response.json();
  
  if (data.success) {
    // Rediriger vers Google
    window.location.href = data.data.authUrl;
  }
};
```

### 3. Gérer le Callback

Après authentification, Google redirige vers votre frontend avec un `code`. Votre frontend doit appeler le callback :

```javascript
// Frontend - Page /auth/callback
useEffect(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const error = urlParams.get('error');

  if (error) {
    console.error('Erreur:', error);
    return;
  }

  if (code) {
    // Appeler le callback backend
    fetch(`/api/auth/google/callback?code=${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          // Sauvegarder les tokens
          localStorage.setItem('accessToken', data.data.session.accessToken);
          localStorage.setItem('refreshToken', data.data.session.refreshToken);
          
          // Rediriger vers la page d'accueil
          window.location.href = '/';
        }
      });
  }
}, []);
```

**Note :** Pour une meilleure sécurité, le callback devrait être géré côté serveur. Le flux recommandé est :

1. Frontend redirige vers `/api/auth/google`
2. Backend redirige vers Google
3. Google redirige vers Supabase callback
4. Supabase redirige vers votre frontend avec `access_token` dans l'URL
5. Frontend extrait le token et appelle votre API pour finaliser

## 🔄 Flux Complet Recommandé

### Option 1: Redirection Directe (Plus Simple)

```javascript
// Frontend
const handleGoogleLogin = () => {
  // Rediriger directement vers l'endpoint Google
  window.location.href = 'http://localhost:3000/api/auth/google';
};
```

L'endpoint `/api/auth/google` redirige automatiquement vers Google, puis vers Supabase, puis vers votre frontend.

### Option 2: Avec Gestion du Token (Plus Sécurisé)

1. Frontend appelle `/api/auth/google` pour obtenir l'URL
2. Redirige vers cette URL
3. Google → Supabase → Frontend avec `access_token`
4. Frontend envoie le token à votre backend pour validation

## 🧪 Test avec CURL

### Obtenir l'URL d'authentification

```bash
curl -X GET 'http://localhost:3000/api/auth/google?redirectTo=http://localhost:3001/auth/callback'
```

### Tester le callback (nécessite un code valide)

```bash
curl -X GET 'http://localhost:3000/api/auth/google/callback?code=CODE_FROM_GOOGLE'
```

## ⚠️ Notes Importantes

1. **Client ID et Secret** : Gardez-les secrets, ne les commitez jamais dans Git
2. **URLs de redirection** : Doivent correspondre exactement à celles configurées dans Google Cloud Console
3. **HTTPS en production** : Google exige HTTPS pour les URLs de production
4. **Email vérifié** : Les utilisateurs Google ont automatiquement leur email vérifié
5. **Métadonnées** : Les informations (nom, prénom) sont extraites depuis le profil Google

## 🐛 Dépannage

### Erreur: "redirect_uri_mismatch"
- Vérifiez que l'URL de redirection dans Google Cloud Console correspond exactement
- Vérifiez les URLs dans Supabase Dashboard

### Erreur: "invalid_client"
- Vérifiez que le Client ID et Secret sont corrects dans Supabase
- Vérifiez que l'API Google+ est activée dans Google Cloud Console

### L'utilisateur n'est pas créé dans la table users
- Vérifiez les logs du serveur
- L'utilisateur est créé automatiquement lors du callback
- Vérifiez que la table `users` existe et a les bonnes colonnes

## 📚 Ressources

- [Documentation Supabase OAuth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
