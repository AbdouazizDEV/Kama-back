import { IAnnonceRepository } from '../../domain/repositories/IAnnonceRepository';
import { ApiError } from '@/shared/utils/ApiError';

export interface DeleteAnnonceInput {
  annonceId: string;
  proprietaireId: string;
}

export class DeleteAnnonceUseCase {
  constructor(private annonceRepository: IAnnonceRepository) {}

  async execute(input: DeleteAnnonceInput): Promise<void> {
    const annonce = await this.annonceRepository.findById(input.annonceId);
    if (!annonce) {
      throw ApiError.notFound('Annonce');
    }

    // Vérifier que c'est le propriétaire
    if (annonce.proprietaireId !== input.proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à supprimer cette annonce');
    }

    await this.annonceRepository.delete(input.annonceId);
  }
}
