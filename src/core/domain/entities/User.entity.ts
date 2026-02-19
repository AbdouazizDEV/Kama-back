import { Email } from '../value-objects/Email.vo';
import { Password } from '../value-objects/Password.vo';

export enum UserType {
  LOCATAIRE = 'LOCATAIRE',
  PROPRIETAIRE = 'PROPRIETAIRE',
  ETUDIANT = 'ETUDIANT',
  ADMIN = 'ADMIN',
}

export abstract class User {
  constructor(
    public readonly id: string,
    public readonly email: Email,
    protected password: Password,
    public nom: string,
    public prenom: string,
    public telephone: string,
    public photoProfil: string | null,
    public readonly dateInscription: Date,
    public estActif: boolean,
    public estVerifie: boolean,
    public readonly typeUtilisateur: UserType
  ) {}

  async verifyPassword(plainPassword: string): Promise<boolean> {
    return this.password.compare(plainPassword);
  }

  async changePassword(newPassword: Password): Promise<void> {
    this.password = newPassword;
  }

  activate(): void {
    this.estActif = true;
  }

  deactivate(): void {
    this.estActif = false;
  }

  verify(): void {
    this.estVerifie = true;
  }

  updateProfile(data: Partial<Pick<User, 'nom' | 'prenom' | 'telephone' | 'photoProfil'>>): void {
    if (data.nom) this.nom = data.nom;
    if (data.prenom) this.prenom = data.prenom;
    if (data.telephone) this.telephone = data.telephone;
    if (data.photoProfil !== undefined) this.photoProfil = data.photoProfil;
  }

  getFullName(): string {
    return `${this.prenom} ${this.nom}`;
  }

  getPasswordHash(): string {
    return this.password.getHash();
  }
}
