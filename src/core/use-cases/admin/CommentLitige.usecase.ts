import { ILitigeRepository } from '@/core/domain/repositories/ILitigeRepository';
import { ApiError } from '@/shared/utils/ApiError';

export interface CommentLitigeInput {
  litigeId: string;
  auteurId: string;
  commentaire: string;
}

export class CommentLitigeUseCase {
  constructor(private litigeRepository: ILitigeRepository) {}

  async execute(input: CommentLitigeInput): Promise<void> {
    const litige = await this.litigeRepository.findById(input.litigeId);

    if (!litige) {
      throw ApiError.notFound('Litige');
    }

    litige.addComment(input.auteurId, input.commentaire);
    await this.litigeRepository.update(litige);
  }
}
