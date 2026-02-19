# 📧 Configuration Email Supabase - Guide Complet

## 🔍 Problème : Les emails ne sont pas reçus

Si vous ne recevez pas les emails de vérification, voici les étapes pour résoudre le problème.

## ✅ Étape 1: Vérifier la Configuration Email dans Supabase

### 1.1 Aller dans Authentication > Email Templates

1. Dans votre dashboard Supabase, allez dans **Authentication** > **Email Templates**
2. Vérifiez que les templates sont activés :
   - ✅ **Confirm signup** - Template pour la vérification d'email
   - ✅ **Reset password** - Template pour la réinitialisation

### 1.2 Vérifier les Paramètres SMTP

1. Allez dans **Settings** > **Auth**
2. Vérifiez la section **SMTP Settings**

**Options :**

#### Option A: Utiliser Supabase Email (Gratuit, limité)

- Par défaut, Supabase envoie les emails via son propre service
- **Limite** : 3 emails/heure en plan gratuit
- **Vérifiez** : Que "Enable email confirmations" est activé

#### Option B: Configurer un SMTP personnalisé (Recommandé pour production)

1. Cliquez sur **"Use custom SMTP"**
2. Configurez avec un service comme :
   - **SendGrid**
   - **Mailgun**
   - **AWS SES**
   - **Gmail SMTP** (pour tests)

**Exemple avec SendGrid :**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: VOTRE_SENDGRID_API_KEY
Sender email: noreply@kama.com
Sender name: Kama
```

## ✅ Étape 2: Activer la Vérification d'Email

1. Allez dans **Authentication** > **Settings**
2. Vérifiez que :
   - ✅ **Enable email confirmations** est activé
   - ✅ **Secure email change** est activé (optionnel)

## ✅ Étape 3: Vérifier les URLs de Redirection

1. Allez dans **Authentication** > **URL Configuration**
2. Configurez :
   - **Site URL**: `http://localhost:3001` (votre frontend)
   - **Redirect URLs**: 
     ```
     http://localhost:3001/**
     http://localhost:3001/auth/verify-email
     http://localhost:3001/auth/reset-password
     ```

## ✅ Étape 4: Activer la Protection contre les Mots de Passe Compromis

D'après l'avertissement que vous avez vu :

1. Allez dans **Authentication** > **Settings**
2. Activez **"Enable leaked password protection"**
3. Cela vérifie les mots de passe contre HaveIBeenPwned.org

## ✅ Étape 5: Tester l'Envoi d'Email

### Test via l'API Supabase

```bash
# Tester l'envoi d'un email de vérification
curl -X POST 'https://hzeiyyzopquxmgxpuhpo.supabase.co/auth/v1/resend' \
  -H "apikey: VOTRE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "signup",
    "email": "aadiop@dizigroup.net"
  }'
```

### Vérifier les Logs

1. Allez dans **Logs** > **Auth Logs**
2. Vérifiez si des emails ont été envoyés
3. Vérifiez s'il y a des erreurs

## 🐛 Dépannage

### Problème: "Email not sent"

**Solutions :**
1. Vérifiez que vous n'avez pas dépassé la limite (3/heure en gratuit)
2. Vérifiez les logs dans Supabase
3. Vérifiez que l'email n'est pas dans les spams
4. Utilisez un SMTP personnalisé

### Problème: "SMTP configuration error"

**Solutions :**
1. Vérifiez les identifiants SMTP
2. Vérifiez que le port est correct (587 pour TLS, 465 pour SSL)
3. Vérifiez que le firewall n'bloque pas

### Problème: Emails dans les spams

**Solutions :**
1. Configurez SPF, DKIM, DMARC pour votre domaine
2. Utilisez un service email professionnel (SendGrid, Mailgun)
3. Vérifiez la réputation de votre domaine

## 📝 Configuration Recommandée pour Production

```env
# Dans Supabase Dashboard > Settings > Auth > SMTP Settings

SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Pass: SG.xxxxxxxxxxxxx (votre clé SendGrid)
Sender email: noreply@kama.com
Sender name: Kama Platform
```

## 🔧 Script de Test

Créez un script pour tester l'envoi d'email :

```typescript
// scripts/test-email.ts
import { supabase } from '../src/config/supabase.config';

async function testEmail() {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email: 'aadiop@dizigroup.net',
  });

  if (error) {
    console.error('Erreur:', error);
  } else {
    console.log('Email envoyé avec succès');
  }
}

testEmail();
```

## ⚠️ Notes Importantes

1. **Plan Gratuit Supabase** : Limite de 3 emails/heure
2. **Pour la production** : Utilisez un SMTP personnalisé
3. **Vérifiez toujours les spams** avant de déclarer un problème
4. **Les emails peuvent prendre quelques minutes** à arriver
