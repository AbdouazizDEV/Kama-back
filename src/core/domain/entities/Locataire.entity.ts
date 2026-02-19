import { User, UserType } from './User.entity';
import { Email } from '../value-objects/Email.vo';
import { Password } from '../value-objects/Password.vo';

export class Locataire extends User {
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
    public readonly dateNaissance: Date | null = null,
    public readonly profession: string | null = null,
    public readonly revenusMensuels: number | null = null
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
      UserType.LOCATAIRE
    );
  }
}
