import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IAuthService } from '../../domain/services/IAuthService';
import { ApiError } from '@/shared/utils/ApiError';

export interface LoginUserInput {
  email: string;
  password: string;
}

export interface LoginUserOutput {
  user: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    typeUtilisateur: string;
  };
  accessToken: string;
  refreshToken: string;
}

export class LoginUserUseCase {
  constructor(
    private userRepository: IUserRepository,
    private authService: IAuthService
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    // Trouver l'utilisateur
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw ApiError.unauthorized('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.verifyPassword(input.password);
    if (!isPasswordValid) {
      throw ApiError.unauthorized('Email ou mot de passe incorrect');
    }

    // Vérifier que le compte est actif
    if (!user.estActif) {
      throw ApiError.forbidden('Votre compte a été désactivé');
    }

    // Vérifier que l'email est vérifié
    if (!user.estVerifie) {
      throw ApiError.forbidden('Veuillez vérifier votre email avant de vous connecter');
    }

    // Générer les tokens
    const { accessToken, refreshToken } = await this.authService.generateTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email.getValue(),
        nom: user.nom,
        prenom: user.prenom,
        typeUtilisateur: user.typeUtilisateur,
      },
      accessToken,
      refreshToken,
    };
  }
}
