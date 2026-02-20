import { IAvisRepository } from '@/core/domain/repositories/IAvisRepository';
import { ApiError } from '@/shared/utils/ApiError';

export interface UpdateAvisInput {
  note?: number;
  commentaire?: string;
}

export class UpdateAvisUseCase {
  constructor(private avisRepository: IAvisRepository) {}

  async execute(avisId: string, locataireId: string, input: UpdateAvisInput) {
    const avis = await this.avisRepository.findById(avisId);

    if (!avis) {
      throw ApiError.notFound('Avis');
    }

    // Vérifier que l'avis appartient au locataire
    if (avis.locataireId !== locataireId) {
      throw ApiError.forbidden('Vous n\'avez pas accès à cet avis');
    }

    // Mettre à jour l'avis
    avis.update(input.note, input.commentaire);
    await this.avisRepository.update(avis);

    return avis;
  }
}
