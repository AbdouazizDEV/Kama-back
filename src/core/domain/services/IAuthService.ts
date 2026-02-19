import { User } from '../entities/User.entity';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface IAuthService {
  generateTokens(user: User): Promise<TokenPair>;
  verifyToken(token: string): Promise<TokenPayload>;
  refreshToken(refreshToken: string): Promise<TokenPair>;
}

export interface TokenPayload {
  userId: string;
  email: string;
  typeUtilisateur: string;
  iat?: number;
  exp?: number;
}
