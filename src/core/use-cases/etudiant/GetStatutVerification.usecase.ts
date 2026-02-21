import { IEtudiantRepository } from '@/core/domain/repositories/IEtudiantRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class GetStatutVerificationUseCase {
  constructor(
    private etudiantRepository: IEtudiantRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.typeUtilisateur !== UserType.ETUDIANT) {
      throw ApiError.forbidden('Accès réservé aux étudiants');
    }

    const etudiant = await this.etudiantRepository.findByUserId(userId);
    if (!etudiant) {
      return {
        statutVerification: 'EN_ATTENTE',
        hasDocuments: false,
        universite: null,
        filiere: null,
        niveauEtude: null,
      };
    }

    return {
      statutVerification: etudiant.statutVerification,
      hasDocuments: !!(etudiant.carteEtudianteUrl && etudiant.attestationInscriptionUrl),
      universite: etudiant.universite,
      filiere: etudiant.filiere,
      niveauEtude: etudiant.niveauEtude,
      dateVerification: etudiant.dateVerification,
      motifRejet: etudiant.motifRejet,
    };
  }
}
