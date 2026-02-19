export interface IStorageService {
  uploadFile(file: Buffer, fileName: string, folder: string): Promise<string>;
  deleteFile(fileUrl: string): Promise<void>;
  getFileUrl(filePath: string): string;
}
