import { IStorageService } from '@/core/domain/services/IStorageService';
import { supabaseAdmin } from '@/config/supabase.config';
import { randomUUID } from 'crypto';

// Buckets Supabase Storage
export enum StorageBucket {
  ANNOUNCE_IMAGES = 'annonces-images',
  ANNOUNCE_VIDEOS = 'annonces-videos',
  USER_AVATARS = 'avatars',
  DOCUMENTS = 'documents',
}

export class SupabaseStorageService implements IStorageService {
  /**
   * Upload un fichier (image ou vidéo) dans le bucket approprié
   */
  async uploadFile(file: Buffer, fileName: string, folder: string): Promise<string> {
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    const isImage = this.isImageFile(fileExt);
    const isVideo = this.isVideoFile(fileExt);

    // Déterminer le bucket selon le type de fichier
    let bucket: StorageBucket;
    if (isImage) {
      bucket = folder === 'avatars' ? StorageBucket.USER_AVATARS : StorageBucket.ANNOUNCE_IMAGES;
    } else if (isVideo) {
      bucket = StorageBucket.ANNOUNCE_VIDEOS;
    } else {
      bucket = StorageBucket.DOCUMENTS;
    }

    const filePath = `${folder}/${randomUUID()}.${fileExt}`;

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: this.getContentType(fileExt),
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }

    return this.getFileUrl(data.path, bucket);
  }

  /**
   * Upload une image spécifiquement pour les annonces
   */
  async uploadAnnonceImage(file: Buffer, fileName: string, annonceId: string): Promise<string> {
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    if (!this.isImageFile(fileExt)) {
      throw new Error('Le fichier doit être une image');
    }

    const filePath = `annonces/${annonceId}/${randomUUID()}.${fileExt}`;

    const { data, error } = await supabaseAdmin.storage
      .from(StorageBucket.ANNOUNCE_IMAGES)
      .upload(filePath, file, {
        contentType: this.getContentType(fileExt),
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      throw new Error(`Erreur lors de l'upload de l'image: ${error.message}`);
    }

    return this.getFileUrl(data.path, StorageBucket.ANNOUNCE_IMAGES);
  }

  /**
   * Upload une vidéo spécifiquement pour les annonces
   */
  async uploadAnnonceVideo(file: Buffer, fileName: string, annonceId: string): Promise<string> {
    const fileExt = fileName.split('.').pop()?.toLowerCase() || '';
    if (!this.isVideoFile(fileExt)) {
      throw new Error('Le fichier doit être une vidéo');
    }

    const filePath = `annonces/${annonceId}/${randomUUID()}.${fileExt}`;

    const { data, error } = await supabaseAdmin.storage
      .from(StorageBucket.ANNOUNCE_VIDEOS)
      .upload(filePath, file, {
        contentType: this.getContentType(fileExt),
        upsert: false,
        cacheControl: '3600',
      });

    if (error) {
      throw new Error(`Erreur lors de l'upload de la vidéo: ${error.message}`);
    }

    return this.getFileUrl(data.path, StorageBucket.ANNOUNCE_VIDEOS);
  }

  /**
   * Supprime un fichier
   */
  async deleteFile(fileUrl: string): Promise<void> {
    // Essayer de détecter le bucket depuis l'URL
    let bucket: StorageBucket | null = null;
    let filePath: string | null = null;

    // Patterns d'URL Supabase Storage
    const patterns = [
      { bucket: StorageBucket.ANNOUNCE_IMAGES, pattern: '/storage/v1/object/public/annonces-images/' },
      { bucket: StorageBucket.ANNOUNCE_VIDEOS, pattern: '/storage/v1/object/public/annonces-videos/' },
      { bucket: StorageBucket.USER_AVATARS, pattern: '/storage/v1/object/public/avatars/' },
      { bucket: StorageBucket.DOCUMENTS, pattern: '/storage/v1/object/public/documents/' },
    ];

    for (const { bucket: b, pattern } of patterns) {
      if (fileUrl.includes(pattern)) {
        bucket = b;
        filePath = fileUrl.split(pattern)[1];
        break;
      }
    }

    if (!bucket || !filePath) {
      throw new Error('URL de fichier invalide ou bucket non reconnu');
    }

    const { error } = await supabaseAdmin.storage.from(bucket).remove([filePath]);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  /**
   * Obtient l'URL publique d'un fichier
   */
  getFileUrl(filePath: string, bucket: StorageBucket = StorageBucket.ANNOUNCE_IMAGES): string {
    const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  /**
   * Vérifie si le fichier est une image
   */
  private isImageFile(ext: string): boolean {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
    return imageExts.includes(ext.toLowerCase());
  }

  /**
   * Vérifie si le fichier est une vidéo
   */
  private isVideoFile(ext: string): boolean {
    const videoExts = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'];
    return videoExts.includes(ext.toLowerCase());
  }

  /**
   * Obtient le type MIME du fichier
   */
  private getContentType(ext: string): string {
    const contentTypes: Record<string, string> = {
      // Images
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      svg: 'image/svg+xml',
      bmp: 'image/bmp',
      // Vidéos
      mp4: 'video/mp4',
      webm: 'video/webm',
      ogg: 'video/ogg',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      mkv: 'video/x-matroska',
      // Documents
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
  }
}
