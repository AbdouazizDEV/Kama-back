import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { IEmailService } from '../../domain/services/IEmailService';
import { Password } from '../../domain/value-objects/Password.vo';
import { ApiError } from '@/shared/utils/ApiError';
import { randomUUID } from 'crypto';

export interface ResetPasswordInput {
  email: string;
}

export interface ConfirmResetPasswordInput {
  token: string;
  newPassword: string;
}

export class ResetPasswordUseCase {
  constructor(
    private userRepository: IUserRepository,
    private emailService: IEmailService
  ) {}

  async requestReset(input: ResetPasswordInput): Promise<void> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      // Ne pas révéler que l'email n'existe pas (sécurité)
      return;
    }

    // Générer un token de réinitialisation
    const resetToken = randomUUID();
    // TODO: Stocker le token avec une expiration (ex: 1 heure)

    // Envoyer l'email de réinitialisation
    await this.emailService.sendPasswordResetEmail(input.email, resetToken);
  }

  async confirmReset(input: ConfirmResetPasswordInput): Promise<void> {
    // TODO: Vérifier le token et son expiration
    // Pour l'instant, on suppose que le token est valide

    // TODO: Récupérer l'userId depuis le token
    const userId = ''; // À implémenter avec le système de tokens

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    const newPassword = await Password.create(input.newPassword);
    await user.changePassword(newPassword);
    await this.userRepository.update(user);
  }
}
