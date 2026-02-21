export interface IStorageService {
  uploadFile(file: Buffer, fileName: string, folder: string): Promise<string>;
  uploadDocument(file: Buffer, fileName: string, userId: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  getFileUrl(filePath: string, bucket?: any): string;
}
