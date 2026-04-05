import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailService } from '../../domain/services/IEmailService';
import { User, UserType } from '../../domain/entities/User.entity';
import { Locataire } from '../../domain/entities/Locataire.entity';
import { Proprietaire } from '../../domain/entities/Proprietaire.entity';
import { Etudiant } from '../../domain/entities/Etudiant.entity';
import { Email } from '../../domain/value-objects/Email.vo';
import { Password } from '../../domain/value-objects/Password.vo';
import { ApiError } from '@/shared/utils/ApiError';
import { randomUUID } from 'crypto';

export interface RegisterUserInput {
  email: string;
  password: string;
  nom: string;
  prenom: string;
  telephone: string;
  typeUtilisateur: UserType;
}

export class RegisterUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async execute(input: RegisterUserInput): Promise<User> {
    // Validation
    const email = new Email(input.email);
    const password = await Password.create(input.password);

    // Vérifier si l'email existe déjà
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw ApiError.conflict('Cet email est déjà utilisé');
    }

    // Créer l'utilisateur (User est abstrait — instancier la sous-classe selon le type)
    const id = randomUUID();
    const dateInscription = new Date();
    let user: User;

    switch (input.typeUtilisateur) {
      case UserType.LOCATAIRE:
        user = new Locataire(
          id,
          email,
          password,
          input.nom,
          input.prenom,
          input.telephone,
          null,
          dateInscription,
          true,
          false
        );
        break;
      case UserType.PROPRIETAIRE:
        user = new Proprietaire(
          id,
          email,
          password,
          input.nom,
          input.prenom,
          input.telephone,
          null,
          dateInscription,
          true,
          false
        );
        break;
      case UserType.ETUDIANT:
        user = new Etudiant(
          id,
          email,
          password,
          input.nom,
          input.prenom,
          input.telephone,
          null,
          dateInscription,
          true,
          false
        );
        break;
      case UserType.ADMIN:
        throw ApiError.badRequest('Création de compte administrateur non autorisée via inscription');
      default: {
        const _n: never = input.typeUtilisateur;
        throw new Error(`Type utilisateur non géré: ${_n}`);
      }
    }

    // Sauvegarder
    await this.userRepository.save(user);

    // Envoyer l'email de vérification
    await this.emailService.sendVerificationEmail(user.email.getValue(), user.id);

    return user;
  }
}
