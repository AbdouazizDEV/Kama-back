import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';

export interface UpdateProfilInput {
  nom?: string;
  prenom?: string;
  telephone?: string;
}

export class UpdateProfilUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(userId: string, input: UpdateProfilInput) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    user.updateProfile({
      nom: input.nom,
      prenom: input.prenom,
      telephone: input.telephone,
    });

    await this.userRepository.update(user);

    return {
      id: user.id,
      email: user.email.getValue(),
      nom: user.nom,
      prenom: user.prenom,
      telephone: user.telephone,
      photoProfil: user.photoProfil,
      typeUtilisateur: user.typeUtilisateur,
      estActif: user.estActif,
      estVerifie: user.estVerifie,
      dateInscription: user.dateInscription,
    };
  }
}
