# 🔒 Guide Pas à Pas : Configuration des Politiques RLS pour Supabase Storage

## 📋 Introduction

Les politiques RLS (Row Level Security) contrôlent qui peut lire, écrire et supprimer les fichiers dans vos buckets Supabase Storage.

## 🎯 Objectif

Configurer les politiques pour que :
- ✅ **Tout le monde** peut **voir** les images/vidéos des annonces (public)
- ✅ **Seuls les utilisateurs connectés** peuvent **uploader** des fichiers
- ✅ **Chaque utilisateur** peut **supprimer** uniquement **ses propres** fichiers

## 🚀 Méthode 1 : Via l'Interface Supabase (Recommandé pour débutants)

### Étape 1 : Accéder aux Politiques Storage

1. Allez sur [supabase.com](https://supabase.com) et connectez-vous
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur **Storage**
4. Cliquez sur **Policies** (ou **Politiques** en français)

### Étape 2 : Configurer le Bucket `annonces-images`

#### 2.1. Politique de Lecture (SELECT) - Public

1. Cliquez sur le bucket `annonces-images`
2. Cliquez sur **"New Policy"** ou **"Nouvelle Politique"**
3. Sélectionnez **"For full customization"** ou **"Personnalisation complète"**
4. Remplissez le formulaire :

   - **Policy name** : `Public Access - Images`
   - **Allowed operation** : Sélectionnez **SELECT** (lecture)
   - **Target roles** : Sélectionnez **public** (tout le monde)
   - **USING expression** : Laissez vide ou mettez `true`
   - **WITH CHECK expression** : Laissez vide

5. Cliquez sur **"Review"** puis **"Save policy"**

#### 2.2. Politique d'Insertion (INSERT) - Utilisateurs connectés

1. Toujours dans le bucket `annonces-images`, cliquez sur **"New Policy"**
2. Sélectionnez **"For full customization"**
3. Remplissez :

   - **Policy name** : `Authenticated Upload - Images`
   - **Allowed operation** : Sélectionnez **INSERT** (écriture)
   - **Target roles** : Sélectionnez **authenticated** (utilisateurs connectés)
   - **USING expression** : Laissez vide
   - **WITH CHECK expression** : Laissez vide (on simplifie pour l'instant)

4. Cliquez sur **"Review"** puis **"Save policy"**

#### 2.3. Politique de Suppression (DELETE) - Utilisateurs connectés

1. Cliquez sur **"New Policy"**
2. Sélectionnez **"For full customization"**
3. Remplissez :

   - **Policy name** : `Authenticated Delete - Images`
   - **Allowed operation** : Sélectionnez **DELETE** (suppression)
   - **Target roles** : Sélectionnez **authenticated**
   - **USING expression** : Laissez vide
   - **WITH CHECK expression** : Laissez vide

4. Cliquez sur **"Review"** puis **"Save policy"**

### Étape 3 : Répéter pour les autres buckets

Répétez les mêmes étapes pour :
- `annonces-videos` (même configuration que `annonces-images`)
- `avatars` (même configuration)

## 🚀 Méthode 2 : Via l'Éditeur SQL (Plus rapide)

Si vous préférez utiliser SQL directement :

### Étape 1 : Accéder à l'Éditeur SQL

1. Dans Supabase Dashboard, cliquez sur **SQL Editor** (ou **Éditeur SQL**)
2. Cliquez sur **"New query"** (Nouvelle requête)

### Étape 2 : Copier-coller le script

Copiez et collez ce script complet dans l'éditeur :

```sql
-- ============================================
-- POLITIQUES RLS POUR SUPABASE STORAGE
-- ============================================

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Public Access - Images" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Videos" ON storage.objects;
DROP POLICY IF EXISTS "Public Access - Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload - Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload - Videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload - Avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete - Images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete - Videos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete - Avatars" ON storage.objects;

-- ============================================
-- BUCKET: annonces-images
-- ============================================

-- Lecture publique (tout le monde peut voir)
CREATE POLICY "Public Access - Images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'annonces-images');

-- Upload pour utilisateurs connectés
CREATE POLICY "Authenticated Upload - Images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'annonces-images');

-- Suppression pour utilisateurs connectés
CREATE POLICY "Authenticated Delete - Images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'annonces-images');

-- ============================================
-- BUCKET: annonces-videos
-- ============================================

-- Lecture publique
CREATE POLICY "Public Access - Videos"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'annonces-videos');

-- Upload pour utilisateurs connectés
CREATE POLICY "Authenticated Upload - Videos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'annonces-videos');

-- Suppression pour utilisateurs connectés
CREATE POLICY "Authenticated Delete - Videos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'annonces-videos');

-- ============================================
-- BUCKET: avatars
-- ============================================

-- Lecture publique
CREATE POLICY "Public Access - Avatars"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- Upload pour utilisateurs connectés
CREATE POLICY "Authenticated Upload - Avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Suppression pour utilisateurs connectés
CREATE POLICY "Authenticated Delete - Avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
```

### Étape 3 : Exécuter le script

1. Cliquez sur **"Run"** (Exécuter) ou appuyez sur `Ctrl+Enter` (ou `Cmd+Enter` sur Mac)
2. Vous devriez voir un message de succès : **"Success. No rows returned"**

## ✅ Vérification

### Vérifier que les politiques sont créées

1. Allez dans **Storage** > **Policies**
2. Vous devriez voir 9 politiques au total :
   - 3 pour `annonces-images` (SELECT, INSERT, DELETE)
   - 3 pour `annonces-videos` (SELECT, INSERT, DELETE)
   - 3 pour `avatars` (SELECT, INSERT, DELETE)

### Test rapide

Vous pouvez tester en essayant d'uploader une image via votre API. Si vous obtenez une erreur de permission, vérifiez que :
- Les buckets existent
- Les politiques sont bien créées
- Vous utilisez la bonne clé API (service role key pour les uploads côté serveur)

## 🔍 Explication des Politiques

### SELECT (Lecture)
```sql
FOR SELECT TO public
```
- **public** = Tout le monde peut lire (même sans être connecté)
- C'est ce qu'on veut pour les images/vidéos des annonces

### INSERT (Écriture)
```sql
FOR INSERT TO authenticated
```
- **authenticated** = Seuls les utilisateurs connectés peuvent uploader
- Empêche les spams et les uploads non autorisés

### DELETE (Suppression)
```sql
FOR DELETE TO authenticated
```
- **authenticated** = Seuls les utilisateurs connectés peuvent supprimer
- Pour l'instant, tous les utilisateurs connectés peuvent supprimer n'importe quel fichier
- On peut restreindre plus tard pour que chacun ne supprime que ses propres fichiers

## 🎯 Configuration Avancée (Optionnel)

Si vous voulez que chaque utilisateur ne puisse supprimer que ses propres fichiers, utilisez cette politique plus stricte :

```sql
-- Suppression uniquement de ses propres fichiers
CREATE POLICY "Users Delete Own Files - Images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'annonces-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

Cette politique vérifie que le premier dossier dans le chemin correspond à l'ID de l'utilisateur connecté.

## 🐛 Problèmes Courants

### Erreur : "Policy already exists"

**Solution** : Supprimez d'abord l'ancienne politique, puis recréez-la.

```sql
DROP POLICY IF EXISTS "Nom de la politique" ON storage.objects;
```

### Erreur : "Bucket does not exist"

**Solution** : Créez d'abord les buckets via l'interface Supabase (Storage > New bucket) ou via SQL :

```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('annonces-images', 'annonces-images', true)
ON CONFLICT (id) DO NOTHING;
```

### Les fichiers ne sont pas accessibles publiquement

**Vérifiez** :
1. Le bucket est marqué comme **public** dans les paramètres
2. La politique SELECT existe et cible **public**
3. L'URL du fichier est correcte

## 📚 Prochaines Étapes

Une fois les politiques configurées :

1. ✅ Testez l'upload d'une image via votre API
2. ✅ Vérifiez que l'image est accessible publiquement
3. ✅ Testez la suppression d'un fichier

## 💡 Astuce

Pour simplifier au maximum, vous pouvez utiliser cette politique "tout ou rien" pour chaque bucket :

```sql
-- Politique permissive pour les annonces (développement uniquement)
CREATE POLICY "Full Access - Images"
ON storage.objects
FOR ALL
TO authenticated
USING (bucket_id = 'annonces-images')
WITH CHECK (bucket_id = 'annonces-images');
```

⚠️ **Attention** : Cette politique est très permissive. Utilisez-la uniquement en développement !

## ✅ Checklist Finale

- [ ] Buckets créés (`annonces-images`, `annonces-videos`, `avatars`)
- [ ] Politiques SELECT créées (lecture publique)
- [ ] Politiques INSERT créées (upload authentifié)
- [ ] Politiques DELETE créées (suppression authentifiée)
- [ ] Test d'upload réussi
- [ ] Test d'accès public réussi

---

**Besoin d'aide ?** Si vous êtes bloqué, vérifiez :
1. Les buckets existent bien
2. Les politiques sont bien créées dans Storage > Policies
3. Vous utilisez les bonnes clés API dans votre code
