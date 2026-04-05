export interface IStorageService {
  uploadFile(file: Buffer, fileName: string, folder: string): Promise<string>;
  uploadAvatar(file: Buffer, fileName: string, userId: string): Promise<string>;
  uploadAnnonceImage(file: Buffer, fileName: string, annonceId: string): Promise<string>;
  uploadAnnonceVideo(file: Buffer, fileName: string, annonceId: string): Promise<string>;
  uploadDocument(file: Buffer, fileName: string, userId: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  getFileUrl(filePath: string, bucket?: string): string;
}
