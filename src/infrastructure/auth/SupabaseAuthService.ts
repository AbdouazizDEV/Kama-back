import { IAuthService, TokenPair, TokenPayload } from '@/core/domain/services/IAuthService';
import { User } from '@/core/domain/entities/User.entity';
import { sign, verify } from 'jsonwebtoken';
import { env } from '@/config/env.config';

export class SupabaseAuthService implements IAuthService {
  async generateTokens(user: User): Promise<TokenPair> {
    const payload: TokenPayload = {
      userId: user.id,
      email: user.email.getValue(),
      typeUtilisateur: user.typeUtilisateur,
    };

    const accessToken = sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });

    const refreshToken = sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const decoded = verify(token, env.jwt.secret) as TokenPayload;
      return decoded;
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    const payload = await this.verifyToken(refreshToken);

    // Générer de nouveaux tokens
    const newPayload: TokenPayload = {
      userId: payload.userId,
      email: payload.email,
      typeUtilisateur: payload.typeUtilisateur,
    };

    const accessToken = sign(newPayload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });

    const newRefreshToken = sign(newPayload, env.jwt.secret, {
      expiresIn: env.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken: newRefreshToken };
  }
}
