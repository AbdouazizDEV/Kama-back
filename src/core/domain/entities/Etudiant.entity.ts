import { Locataire } from './Locataire.entity';
import { Email } from '../value-objects/Email.vo';
import { Password } from '../value-objects/Password.vo';

export enum StatutVerificationEtudiant {
  EN_ATTENTE = 'EN_ATTENTE',
  VALIDE = 'VALIDE',
  REJETE = 'REJETE',
}

export class Etudiant extends Locataire {
  constructor(
    id: string,
    email: Email,
    password: Password,
    nom: string,
    prenom: string,
    telephone: string,
    photoProfil: string | null,
    dateInscription: Date,
    estActif: boolean,
    estVerifie: boolean,
    dateNaissance: Date | null = null,
    profession: string | null = null,
    revenusMensuels: number | null = null,
    public readonly universite: string | null = null,
    public readonly filiere: string | null = null,
    public readonly niveauEtude: string | null = null,
    public readonly numeroEtudiant: string | null = null,
    public readonly statutVerification: StatutVerificationEtudiant = StatutVerificationEtudiant.EN_ATTENTE,
    public readonly carteEtudianteUrl: string | null = null,
    public readonly attestationInscriptionUrl: string | null = null,
    public readonly dateVerification: Date | null = null,
    public readonly motifRejet: string | null = null
  ) {
    super(
      id,
      email,
      password,
      nom,
      prenom,
      telephone,
      photoProfil,
      dateInscription,
      estActif,
      estVerifie,
      dateNaissance,
      profession,
      revenusMensuels
    );
  }

  updateUniversite(universite: string, filiere: string, niveauEtude: string): void {
    (this as any).universite = universite;
    (this as any).filiere = filiere;
    (this as any).niveauEtude = niveauEtude;
  }

  uploadDocuments(carteEtudianteUrl: string, attestationInscriptionUrl: string): void {
    (this as any).carteEtudianteUrl = carteEtudianteUrl;
    (this as any).attestationInscriptionUrl = attestationInscriptionUrl;
    (this as any).statutVerification = StatutVerificationEtudiant.EN_ATTENTE;
  }

  isVerified(): boolean {
    return this.statutVerification === StatutVerificationEtudiant.VALIDE;
  }

  isPending(): boolean {
    return this.statutVerification === StatutVerificationEtudiant.EN_ATTENTE;
  }
}
