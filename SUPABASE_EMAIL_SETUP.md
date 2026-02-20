# 📧 Configuration Email avec Supabase

Ce guide explique comment configurer l'envoi d'emails avec Supabase pour remplacer SendGrid.

## 🎯 Architecture

- **Emails d'authentification** : Utilise Supabase Auth directement (vérification, reset password)
- **Emails personnalisés** : Utilise Supabase Edge Functions avec Resend (contact, newsletter, réservation)

## ✅ Étape 1: Configurer SMTP dans Supabase

### 1.1 Aller dans Authentication > Paramètres SMTP

1. Dans votre dashboard Supabase, allez dans **Authentication** > **E-mails** > **Paramètres SMTP**
2. Cliquez sur **"Configurer SMTP"**

### 1.2 Options de Configuration

#### Option A: Utiliser le service intégré Supabase (Gratuit, limité)
- ✅ Déjà activé par défaut
- ⚠️ **Limite** : 3 emails/heure en plan gratuit
- ✅ Fonctionne pour les emails d'authentification

#### Option B: Configurer un SMTP personnalisé (Recommandé)

Vous pouvez configurer un SMTP avec :
- **Resend** (Recommandé - gratuit jusqu'à 3000 emails/mois)
- **SendGrid** (Gratuit jusqu'à 100 emails/jour)
- **Mailgun** (Gratuit jusqu'à 5000 emails/mois)
- **AWS SES** (Payant mais très économique)

**Exemple avec Resend :**
```
SMTP Host: smtp.resend.com
SMTP Port: 587
SMTP User: resend
SMTP Pass: re_xxxxxxxxxxxxx (votre clé API Resend)
Sender email: noreply@kama.com
Sender name: Kama
```

## ✅ Étape 2: Créer la Edge Function pour les emails personnalisés

### 2.1 Installer Supabase CLI

```bash
npm install -g supabase
```

### 2.2 Se connecter à Supabase

```bash
supabase login
```

### 2.3 Lier le projet

```bash
supabase link --project-ref hzeiyyzopquxmgxpuhpo
```

### 2.4 Créer la fonction

```bash
supabase functions new send-email
```

### 2.5 Configurer Resend (Optionnel mais recommandé)

1. Créez un compte sur [Resend](https://resend.com)
2. Obtenez votre clé API
3. Ajoutez-la dans Supabase Dashboard > Edge Functions > Secrets :

```bash
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 2.6 Déployer la fonction

```bash
supabase functions deploy send-email
```

## ✅ Étape 3: Vérifier la Configuration

### 3.1 Vérifier les templates d'email

1. Allez dans **Authentication** > **E-mails** > **Modèles**
2. Vérifiez que les templates sont activés :
   - ✅ **Confirmer l'inscription**
   - ✅ **Réinitialiser le mot de passe**
   - ✅ **Lien magique**

### 3.2 Vérifier les URLs de redirection

1. Allez dans **Authentication** > **Configuration de l'URL**
2. Configurez :
   - **Site URL**: `http://localhost:3001` (votre frontend)
   - **Redirect URLs**: 
     ```
     http://localhost:3001/**
     http://localhost:3001/auth/verify-email
     http://localhost:3001/auth/reset-password
     ```

## ✅ Étape 4: Tester

### 4.1 Tester l'email de vérification

```bash
curl -X POST http://localhost:3000/api/auth/test-email \
  -H 'Content-Type: application/json' \
  -d '{"email":"abdouazizdiop583@gmail.com"}'
```

### 4.2 Tester l'email de contact

```bash
curl -X POST http://localhost:3000/api/public/contact \
  -H 'Content-Type: application/json' \
  -d '{
    "nom":"Test",
    "email":"abdouazizdiop583@gmail.com",
    "sujet":"Test",
    "message":"Message test"
  }'
```

## 🔧 Configuration Alternative: Sans Edge Function

Si vous ne voulez pas utiliser Edge Functions, vous pouvez :

1. **Configurer SMTP personnalisé dans Supabase** (voir Étape 1.2)
2. **Modifier `SupabaseEmailService.ts`** pour utiliser directement le SMTP configuré

Cependant, Supabase n'a pas d'API directe pour les emails personnalisés, donc vous devrez :
- Soit utiliser Edge Functions
- Soit garder SendGrid/Resend pour les emails personnalisés
- Soit créer un service email séparé

## 📝 Variables d'environnement

Vous n'avez plus besoin de :
- `SENDGRID_API_KEY`
- `SENDGRID_FROM_EMAIL`

Les emails d'authentification utilisent directement Supabase Auth.

## ⚠️ Limitations

1. **Plan Gratuit Supabase** : 3 emails/heure pour le service intégré
2. **Pour la production** : Configurez un SMTP personnalisé ou utilisez Edge Functions avec Resend
3. **Emails personnalisés** : Nécessitent Edge Functions ou un service externe

## 🎉 Avantages

✅ Pas besoin de SendGrid  
✅ Emails d'authentification gérés automatiquement  
✅ Configuration centralisée dans Supabase  
✅ Gratuit jusqu'à 3000 emails/mois avec Resend  
