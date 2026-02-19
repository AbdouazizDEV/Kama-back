import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailService } from '../../domain/services/IEmailService';
import { User, UserType } from '../../domain/entities/User.entity';
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

    // Créer l'utilisateur
    const user = new User(
      randomUUID(),
      email,
      password,
      input.nom,
      input.prenom,
      input.telephone,
      null,
      new Date(),
      true,
      false,
      input.typeUtilisateur
    );

    // Sauvegarder
    await this.userRepository.save(user);

    // Envoyer l'email de vérification
    await this.emailService.sendVerificationEmail(user.email.getValue(), user.id);

    return user;
  }
}
