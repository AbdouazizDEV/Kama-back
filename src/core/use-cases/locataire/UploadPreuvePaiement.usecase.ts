import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';
import { IStorageService } from '@/core/domain/services/IStorageService';
import { ApiError } from '@/shared/utils/ApiError';

export class UploadPreuvePaiementUseCase {
  constructor(
    private paiementRepository: IPaiementRepository,
    private storageService: IStorageService
  ) {}

  async execute(paiementId: string, locataireId: string, file: Buffer, fileName: string) {
    const paiement = await this.paiementRepository.findById(paiementId);

    if (!paiement) {
      throw ApiError.notFound('Paiement');
    }

    // Vérifier que le paiement appartient au locataire
    if (paiement.locataireId !== locataireId) {
      throw ApiError.forbidden('Vous n\'avez pas accès à ce paiement');
    }

    // Uploader la preuve de paiement
    const preuveUrl = await this.storageService.uploadDocument(
      file,
      fileName,
      locataireId
    );

    // TODO: Stocker l'URL de la preuve dans la base de données
    // Pour l'instant, on retourne juste l'URL

    return preuveUrl;
  }
}
