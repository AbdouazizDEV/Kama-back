import { User, UserType } from './User.entity';
import { Email } from '../value-objects/Email.vo';
import { Password } from '../value-objects/Password.vo';

export class Proprietaire extends User {
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
    public readonly numeroPieceIdentite: string | null = null,
    public readonly estVerifieIdentite: boolean = false,
    public readonly noteMoyenne: number = 0,
    public readonly nombreAvis: number = 0
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
      UserType.PROPRIETAIRE
    );
  }

  verifyIdentity(): void {
    this.estVerifieIdentite = true;
  }

  updateRating(note: number): void {
    const totalNotes = this.noteMoyenne * this.nombreAvis + note;
    this.nombreAvis++;
    this.noteMoyenne = totalNotes / this.nombreAvis;
  }
}
