import { IEtudiantRepository } from '@/core/domain/repositories/IEtudiantRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IStorageService } from '@/core/domain/services/IStorageService';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export interface UploadDocumentsVerificationInput {
  userId: string;
  carteEtudiante: File;
  attestationInscription: File;
}

export class UploadDocumentsVerificationUseCase {
  constructor(
    private etudiantRepository: IEtudiantRepository,
    private userRepository: IUserRepository,
    private storageService: IStorageService
  ) {}

  async execute(input: UploadDocumentsVerificationInput): Promise<void> {
    // Vérifier que l'utilisateur existe et est un étudiant
    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.typeUtilisateur !== UserType.ETUDIANT) {
      throw ApiError.forbidden('Accès réservé aux étudiants');
    }

    // Vérifier les types de fichiers
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(input.carteEtudiante.type)) {
      throw ApiError.badRequest('Type de fichier non autorisé pour la carte étudiante');
    }
    if (!allowedTypes.includes(input.attestationInscription.type)) {
      throw ApiError.badRequest('Type de fichier non autorisé pour l\'attestation');
    }

    // Vérifier la taille des fichiers (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (input.carteEtudiante.size > maxSize) {
      throw ApiError.badRequest('La carte étudiante ne doit pas dépasser 5MB');
    }
    if (input.attestationInscription.size > maxSize) {
      throw ApiError.badRequest('L\'attestation ne doit pas dépasser 5MB');
    }

    // Convertir les fichiers File en Buffer
    const carteEtudianteBuffer = Buffer.from(await input.carteEtudiante.arrayBuffer());
    const attestationBuffer = Buffer.from(await input.attestationInscription.arrayBuffer());

    // Uploader les fichiers dans le bucket documents
    const carteEtudianteUrl = await this.storageService.uploadDocument(
      carteEtudianteBuffer,
      `carte-etudiante-${Date.now()}.${this.getFileExtension(input.carteEtudiante.name)}`,
      input.userId
    );

    const attestationUrl = await this.storageService.uploadDocument(
      attestationBuffer,
      `attestation-${Date.now()}.${this.getFileExtension(input.attestationInscription.name)}`,
      input.userId
    );

    // Récupérer ou créer l'entité étudiant
    let etudiant = await this.etudiantRepository.findByUserId(input.userId);
    
    if (!etudiant) {
      // Créer un nouvel étudiant avec les documents
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
        null, null, null, null, // universite, filiere, niveauEtude, numeroEtudiant
        StatutVerificationEtudiant.EN_ATTENTE,
        carteEtudianteUrl,
        attestationUrl,
        null, null // dateVerification, motifRejet
      );
      
      await this.etudiantRepository.save(etudiant);
    } else {
      // Mettre à jour les URLs des documents
      etudiant.uploadDocuments(carteEtudianteUrl, attestationUrl);
      await this.etudiantRepository.update(etudiant);
    }
  }

  private getFileExtension(filename: string): string {
    return filename.split('.').pop() || 'pdf';
  }
}
