import { IEtudiantRepository } from '@/core/domain/repositories/IEtudiantRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export interface UpdateUniversiteInput {
  userId: string;
  universite: string;
  filiere: string;
  niveauEtude: string;
}

export class UpdateUniversiteUseCase {
  constructor(
    private etudiantRepository: IEtudiantRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(input: UpdateUniversiteInput): Promise<void> {
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.typeUtilisateur !== UserType.ETUDIANT) {
      throw ApiError.forbidden('Accès réservé aux étudiants');
    }

    // Valider le niveau d'étude
    const niveauxValides = ['L1', 'L2', 'L3', 'M1', 'M2', 'Doctorat'];
    if (!niveauxValides.includes(input.niveauEtude)) {
      throw ApiError.badRequest('Niveau d\'étude invalide');
    }

    let etudiant = await this.etudiantRepository.findByUserId(input.userId);
    
    if (!etudiant) {
      // Créer un nouvel étudiant avec les informations universitaires
      const { Etudiant, StatutVerificationEtudiant } = await import('@/core/domain/entities/Etudiant.entity');
      const { Email } = await import('@/core/domain/value-objects/Email.vo');
      const { Password } = await import('@/core/domain/value-objects/Password.vo');
      
      const email = Email.create(user.email.getValue());
      const password = Password.fromHash(user.getPasswordHash());
      
      etudiant = new Etudiant(
        user.id,
        email,
        password,
        user.nom,
        user.prenom,
        user.telephone,
        user.photoProfil,
        user.dateInscription,
        user.estActif,
        user.estVerifie,
        null, null, null, // dateNaissance, profession, revenusMensuels
        input.universite,
        input.filiere,
        input.niveauEtude,
        null, // numeroEtudiant
        StatutVerificationEtudiant.EN_ATTENTE,
        null, null, // carteEtudianteUrl, attestationInscriptionUrl
        null, null // dateVerification, motifRejet
      );
      
      await this.etudiantRepository.save(etudiant);
    } else {
      etudiant.updateUniversite(input.universite, input.filiere, input.niveauEtude);
      await this.etudiantRepository.update(etudiant);
    }
  }
}
