# 📧 Guide de Vérification d'Email - Kama Backend

## 🔍 Comprendre le Flux de Vérification

Quand un utilisateur s'inscrit, Supabase envoie un email de confirmation. Il y a **deux méthodes** pour vérifier l'email :

### Méthode 1: Via Redirection Supabase (Recommandée)

1. L'utilisateur clique sur le lien dans l'email
2. Supabase redirige vers votre frontend avec un `access_token` dans l'URL :
   ```
   http://localhost:3001/auth/verify-email#access_token=xxx&type=signup
   ```

3. **Frontend doit extraire le token** et appeler l'API :

```javascript
// Dans votre frontend (React/Next.js)
useEffect(() => {
  // Extraire le token du hash de l'URL
  const hash = window.location.hash;
  const params = new URLSearchParams(hash.substring(1));
  const accessToken = params.get('access_token');
  
  if (accessToken) {
    // Appeler l'endpoint de vérification
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: accessToken,
        type: 'signup'
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Email vérifié avec succès
        console.log('Email vérifié!');
      }
    });
  }
}, []);
```

### Méthode 2: Via Token OTP (Alternative)

Si Supabase envoie un token OTP dans l'email (code à 6 chiffres), l'utilisateur peut l'utiliser :

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "token": "123456",
    "type": "signup"
  }'
```

## 🧪 Tester l'Endpoint

### Option 1: Avec l'access_token depuis l'URL

```bash
curl -X POST http://localhost:3000/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "eyJhbGciOiJFUzI1NiIsImtpZCI6ImMwZDNjODUxLTZkMTQtNDVhMS1hZmZmLTIyZTRlZGFjMTNkYyIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJodHRwczovL2h6ZWl5eXpvcHF1eG1neHB1aHBvLnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiJhZGJjMmNmOS05Nzg2LTQ2NjQtYjA2OS0wNjEyNjI3NDQzMzMiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzcxNDc4NjIxLCJpYXQiOjE3NzE0NzUwMjEsImVtYWlsIjoiYWFkaW9wQGRpemlncm91cC5uZXQiLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoiYWFkaW9wQGRpemlncm91cC5uZXQiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibm9tIjoiRHVwb250IiwicGhvbmVfdmVyaWZpZWQiOmZhbHNlLCJwcmVub20iOiJKZWFuIiwic3ViIjoiYWRiYzJjZjktOTc4Ni00NjY0LWIwNjktMDYxMjYyNzQ0MzMzIiwidGVsZXBob25lIjoiKzI0MTA2MjM0NTY3OCIsInR5cGVfdXRpbGlzYXRldXIiOiJMT0NBVEFJUkUifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQiLCJhYWwiOiJhYWwxIiwiYW1yIjpbeyJtZXRob2QiOiJvdHAiLCJ0aW1lc3RhbXAiOjE3NzE0NzUwMjF9XSwic2Vzc2lvbl9pZCI6IjhiNGM4OGNmLWE3MTAtNDQ0NC1hZDY0LWNlMzQ4NWY2MjhkNyIsImlzX2Fub255bW91cyI6ZmFsc2V9.6O3JjXzSwUvUXbmY_Jb88HK_5B1PUWOMgRdqkzNeH9y0B7zlayPcf1ni5YQ6z-S3dZta8-oo4t2dZK3cao_0_g",
    "type": "signup"
  }'
```

### Option 2: Via l'endpoint de callback (GET)

```bash
curl "http://localhost:3000/api/auth/verify-email-callback?access_token=YOUR_ACCESS_TOKEN&type=signup"
```

## 📝 Exemple de Code Frontend Complet

```typescript
// pages/auth/verify-email.tsx (Next.js)
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Extraire les paramètres du hash
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const type = params.get('type') || 'signup';

    if (!accessToken) {
      setStatus('error');
      setMessage('Token manquant dans l\'URL');
      return;
    }

    // Appeler l'API de vérification
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken,
        type,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStatus('success');
          setMessage('Email vérifié avec succès!');
          // Rediriger vers la page de connexion après 2 secondes
          setTimeout(() => {
            router.push('/auth/login');
          }, 2000);
        } else {
          setStatus('error');
          setMessage(data.error?.message || 'Erreur lors de la vérification');
        }
      })
      .catch((error) => {
        setStatus('error');
        setMessage('Erreur lors de la vérification');
        console.error(error);
      });
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">Vérification de l'email en cours...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-green-600 text-4xl mb-4">✓</div>
            <p className="text-green-600">{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-red-600 text-4xl mb-4">✗</div>
            <p className="text-red-600">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
```

## ⚙️ Configuration Supabase

Assurez-vous que dans **Supabase Dashboard** > **Authentication** > **URL Configuration** :

- **Site URL**: `http://localhost:3001`
- **Redirect URLs**: 
  - `http://localhost:3001/auth/verify-email`
  - `http://localhost:3001/**`

## 🔑 Points Importants

1. **L'access_token est dans le hash (#)** et non dans les query params (?)
2. **Le token expire** après un certain temps (vérifiez `expires_at`)
3. **L'email est déjà vérifié** côté Supabase quand vous recevez l'access_token
4. **Notre endpoint** met à jour notre table `users` pour synchroniser le statut
