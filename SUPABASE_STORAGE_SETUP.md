# 📦 Configuration Supabase Storage - Kama Backend

## 🎯 Vue d'ensemble

Ce guide explique comment configurer Supabase Storage pour stocker les images et vidéos des annonces, ainsi que les avatars des utilisateurs.

## 📋 Prérequis

- Un projet Supabase créé
- Accès au dashboard Supabase
- Clés d'API Supabase configurées dans `.env.local`

## 🚀 Configuration des Buckets

### Étape 1: Accéder au Storage dans Supabase

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Storage** dans le menu de gauche

### Étape 2: Créer les Buckets

Créez les buckets suivants avec les configurations indiquées :

#### 1. Bucket `annonces-images`

- **Nom** : `annonces-images`
- **Public** : ✅ Oui (pour que les images soient accessibles publiquement)
- **File size limit** : 5 MB (recommandé)
- **Allowed MIME types** : 
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `image/webp`
  - `image/svg+xml`

#### 2. Bucket `annonces-videos`

- **Nom** : `annonces-videos`
- **Public** : ✅ Oui
- **File size limit** : 50 MB (recommandé)
- **Allowed MIME types** :
  - `video/mp4`
  - `video/webm`
  - `video/ogg`
  - `video/quicktime`

#### 3. Bucket `avatars`

- **Nom** : `avatars`
- **Public** : ✅ Oui
- **File size limit** : 2 MB (recommandé)
- **Allowed MIME types** :
  - `image/jpeg`
  - `image/png`
  - `image/gif`
  - `image/webp`

#### 4. Bucket `documents` (optionnel)

- **Nom** : `documents`
- **Public** : ❌ Non (privé)
- **File size limit** : 10 MB
- **Allowed MIME types** :
  - `application/pdf`
  - `application/msword`
  - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### Étape 3: Configurer les Politiques RLS (Row Level Security)

Pour chaque bucket, configurez les politiques de sécurité :

#### Pour `annonces-images` et `annonces-videos` (Public)

**Politique de lecture (SELECT)** :
```sql
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'annonces-images' OR bucket_id = 'annonces-videos');
```

**Politique d'insertion (INSERT)** :
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  (bucket_id = 'annonces-images' OR bucket_id = 'annonces-videos')
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Politique de suppression (DELETE)** :
```sql
CREATE POLICY "Users can delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  (bucket_id = 'annonces-images' OR bucket_id = 'annonces-videos')
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

#### Pour `avatars` (Public)

**Politique de lecture (SELECT)** :
```sql
CREATE POLICY "Public Access"
ON storage.objects
FOR SELECT
USING (bucket_id = 'avatars');
```

**Politique d'insertion (INSERT)** :
```sql
CREATE POLICY "Users can upload their own avatar"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Politique de mise à jour (UPDATE)** :
```sql
CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Politique de suppression (DELETE)** :
```sql
CREATE POLICY "Users can delete their own avatar"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

## 🔧 Configuration via SQL Editor

### Option 1 : Script Simple (Recommandé pour débutants)

**👉 Consultez le guide détaillé : [SUPABASE_STORAGE_RLS_GUIDE.md](./SUPABASE_STORAGE_RLS_GUIDE.md)**

Ce guide vous explique pas à pas comment configurer les politiques RLS, avec deux méthodes :
- **Méthode 1** : Via l'interface Supabase (plus visuelle)
- **Méthode 2** : Via SQL (plus rapide)

### Option 2 : Script SQL Complet

Si vous préférez exécuter directement un script SQL, voici le script complet :

```sql
-- Créer les buckets (si pas déjà créés)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('annonces-images', 'annonces-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
  ('annonces-videos', 'annonces-videos', true, 52428800, ARRAY['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']),
  ('avatars', 'avatars', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']),
  ('documents', 'documents', false, 10485760, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
ON CONFLICT (id) DO NOTHING;

-- Politiques RLS simplifiées (voir SUPABASE_STORAGE_RLS_GUIDE.md pour plus de détails)
-- Lecture publique pour tous les buckets publics
CREATE POLICY IF NOT EXISTS "Public Access - Images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'annonces-images');
CREATE POLICY IF NOT EXISTS "Public Access - Videos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'annonces-videos');
CREATE POLICY IF NOT EXISTS "Public Access - Avatars" ON storage.objects FOR SELECT TO public USING (bucket_id = 'avatars');

-- Upload pour utilisateurs connectés
CREATE POLICY IF NOT EXISTS "Authenticated Upload - Images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'annonces-images');
CREATE POLICY IF NOT EXISTS "Authenticated Upload - Videos" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'annonces-videos');
CREATE POLICY IF NOT EXISTS "Authenticated Upload - Avatars" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

-- Suppression pour utilisateurs connectés
CREATE POLICY IF NOT EXISTS "Authenticated Delete - Images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'annonces-images');
CREATE POLICY IF NOT EXISTS "Authenticated Delete - Videos" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'annonces-videos');
CREATE POLICY IF NOT EXISTS "Authenticated Delete - Avatars" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'avatars');
```

## 📝 Utilisation dans le Code

Le service `SupabaseStorageService` est déjà configuré pour utiliser ces buckets :

```typescript
import { SupabaseStorageService, StorageBucket } from '@/infrastructure/storage/SupabaseStorageService';

const storageService = new SupabaseStorageService();

// Upload une image d'annonce
const imageUrl = await storageService.uploadAnnonceImage(
  fileBuffer,
  'photo.jpg',
  annonceId
);

// Upload une vidéo d'annonce
const videoUrl = await storageService.uploadAnnonceVideo(
  fileBuffer,
  'video.mp4',
  annonceId
);

// Upload un avatar
const avatarUrl = await storageService.uploadFile(
  fileBuffer,
  'avatar.jpg',
  'avatars'
);
```

## 🔒 Sécurité

### Bonnes Pratiques

1. **Validation des fichiers côté serveur** : Toujours valider le type MIME et la taille
2. **Limites de taille** : Respecter les limites configurées dans les buckets
3. **Noms de fichiers** : Utiliser des UUIDs pour éviter les collisions
4. **Permissions** : Utiliser RLS pour contrôler l'accès

### Exemple de Validation

```typescript
// Dans votre route API
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

if (file.size > MAX_IMAGE_SIZE) {
  throw new Error('Fichier trop volumineux');
}

if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
  throw new Error('Type de fichier non autorisé');
}
```

## 🧪 Test de Configuration

### Test 1: Vérifier les Buckets

```bash
# Via l'API Supabase
curl -X GET 'https://YOUR_PROJECT.supabase.co/storage/v1/bucket' \
  -H 'apikey: YOUR_ANON_KEY'
```

### Test 2: Upload Test

Créez un endpoint de test :

```typescript
// app/api/test-upload/route.ts
import { SupabaseStorageService } from '@/infrastructure/storage/SupabaseStorageService';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  if (!file) {
    return Response.json({ error: 'No file' }, { status: 400 });
  }
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const storageService = new SupabaseStorageService();
  
  try {
    const url = await storageService.uploadAnnonceImage(
      buffer,
      file.name,
      'test-annonce-id'
    );
    
    return Response.json({ url });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

## 📚 Ressources

- [Documentation Supabase Storage](https://supabase.com/docs/guides/storage)
- [Politiques RLS Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Upload de fichiers](https://supabase.com/docs/guides/storage/uploads)

## ⚠️ Notes Importantes

1. **Coûts** : Le stockage Supabase peut avoir des limites selon votre plan
2. **CDN** : Les fichiers publics sont servis via un CDN pour de meilleures performances
3. **Backup** : Configurez des sauvegardes régulières si nécessaire
4. **Migration** : Si vous changez de bucket, mettez à jour les URLs dans votre base de données

## ✅ Checklist de Configuration

- [ ] Bucket `annonces-images` créé et configuré
- [ ] Bucket `annonces-videos` créé et configuré
- [ ] Bucket `avatars` créé et configuré
- [ ] Bucket `documents` créé et configuré (optionnel)
- [ ] Politiques RLS configurées pour chaque bucket
- [ ] Limites de taille configurées
- [ ] Types MIME autorisés configurés
- [ ] Test d'upload réussi
- [ ] URLs publiques accessibles

## 🐛 Dépannage

### Erreur: "Bucket not found"

Vérifiez que le bucket existe dans Supabase Dashboard > Storage.

### Erreur: "Policy violation"

Vérifiez que les politiques RLS sont correctement configurées.

### Erreur: "File size exceeds limit"

Réduisez la taille du fichier ou augmentez la limite dans les paramètres du bucket.

### Erreur: "Invalid MIME type"

Vérifiez que le type MIME du fichier est dans la liste autorisée du bucket.
