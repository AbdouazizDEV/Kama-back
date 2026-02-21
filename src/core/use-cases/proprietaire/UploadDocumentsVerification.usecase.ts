import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IStorageService } from '@/core/domain/services/IStorageService';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export interface UploadDocumentsVerificationInput {
  userId: string;
  pieceIdentite: File;
  justificatifDomicile?: File;
}

export class UploadDocumentsVerificationProprietaireUseCase {
  constructor(
    private userRepository: IUserRepository,
    private storageService: IStorageService
  ) {}

  async execute(input: UploadDocumentsVerificationInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }
    if (user.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    // Vérifier les types de fichiers
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(input.pieceIdentite.type)) {
      throw ApiError.badRequest('Type de fichier non autorisé pour la pièce d\'identité');
    }
    if (input.justificatifDomicile && !allowedTypes.includes(input.justificatifDomicile.type)) {
      throw ApiError.badRequest('Type de fichier non autorisé pour le justificatif de domicile');
    }

    // Vérifier la taille des fichiers (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (input.pieceIdentite.size > maxSize) {
      throw ApiError.badRequest('La pièce d\'identité ne doit pas dépasser 5MB');
    }
    if (input.justificatifDomicile && input.justificatifDomicile.size > maxSize) {
      throw ApiError.badRequest('Le justificatif de domicile ne doit pas dépasser 5MB');
    }

    // Uploader les fichiers
    const pieceIdentiteBuffer = Buffer.from(await input.pieceIdentite.arrayBuffer());
    const pieceIdentiteUrl = await this.storageService.uploadDocument(
      pieceIdentiteBuffer,
      `piece-identite-${Date.now()}.${this.getFileExtension(input.pieceIdentite.name)}`,
      input.userId
    );

    let justificatifUrl: string | undefined;
    if (input.justificatifDomicile) {
      const justificatifBuffer = Buffer.from(await input.justificatifDomicile.arrayBuffer());
      justificatifUrl = await this.storageService.uploadDocument(
        justificatifBuffer,
        `justificatif-domicile-${Date.now()}.${this.getFileExtension(input.justificatifDomicile.name)}`,
        input.userId
      );
    }

    // TODO: Stocker les URLs dans une table dédiée pour la vérification KYC
    // Pour l'instant, on peut les stocker dans les métadonnées utilisateur ou créer une table VerificationDocuments
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || 'pdf';
  }
}
