import { User } from '../entities/User.entity';

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
  delete(id: string): Promise<void>;
  findAll(filters?: UserFilters): Promise<User[]>;
  count(filters?: UserFilters): Promise<number>;
}

export interface UserFilters {
  typeUtilisateur?: string;
  estActif?: boolean;
  estVerifie?: boolean;
  search?: string;
}
