import { IStorageService } from '@/core/domain/services/IStorageService';
import { supabase } from '@/config/supabase.config';
import { randomUUID } from 'crypto';

export class SupabaseStorageService implements IStorageService {
  async uploadFile(file: Buffer, fileName: string, folder: string): Promise<string> {
    const fileExt = fileName.split('.').pop();
    const filePath = `${folder}/${randomUUID()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        contentType: this.getContentType(fileExt || ''),
        upsert: false,
      });

    if (error) {
      throw new Error(`Erreur lors de l'upload: ${error.message}`);
    }

    return this.getFileUrl(data.path);
  }

  async deleteFile(fileUrl: string): Promise<void> {
    // Extraire le chemin du fichier depuis l'URL
    const filePath = fileUrl.split('/storage/v1/object/public/uploads/')[1];

    if (!filePath) {
      throw new Error('URL de fichier invalide');
    }

    const { error } = await supabase.storage.from('uploads').remove([filePath]);

    if (error) {
      throw new Error(`Erreur lors de la suppression: ${error.message}`);
    }
  }

  getFileUrl(filePath: string): string {
    const { data } = supabase.storage.from('uploads').getPublicUrl(filePath);
    return data.publicUrl;
  }

  private getContentType(ext: string): string {
    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    };

    return contentTypes[ext.toLowerCase()] || 'application/octet-stream';
  }
}
