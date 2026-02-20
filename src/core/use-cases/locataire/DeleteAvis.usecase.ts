import { IAvisRepository } from '@/core/domain/repositories/IAvisRepository';
import { ApiError } from '@/shared/utils/ApiError';

export class DeleteAvisUseCase {
  constructor(private avisRepository: IAvisRepository) {}

  async execute(avisId: string, locataireId: string) {
    const avis = await this.avisRepository.findById(avisId);

    if (!avis) {
      throw ApiError.notFound('Avis');
    }

    // Vérifier que l'avis appartient au locataire
    if (avis.locataireId !== locataireId) {
      throw ApiError.forbidden('Vous n\'avez pas accès à cet avis');
    }

    // Supprimer l'avis
    await this.avisRepository.delete(avisId);
  }
}
