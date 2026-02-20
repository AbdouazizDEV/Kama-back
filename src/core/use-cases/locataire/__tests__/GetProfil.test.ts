import { GetProfilUseCase } from '../GetProfil.usecase';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { User } from '@/core/domain/entities/User.entity';
import { Email } from '@/core/domain/value-objects/Email.vo';
import { Password } from '@/core/domain/value-objects/Password.vo';
import { UserType } from '@/core/domain/entities/User.entity';
import { ApiError } from '@/shared/utils/ApiError';

describe('GetProfilUseCase', () => {
  let useCase: GetProfilUseCase;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      count: jest.fn(),
    };

    useCase = new GetProfilUseCase(mockUserRepository);
  });

  it('should return user profile when user exists', async () => {
    const userId = 'user-123';
    const mockUser = new User(
      userId,
      new Email('test@example.com'),
      await Password.create('Password123!'),
      'Doe',
      'John',
      '+241123456789',
      null,
      new Date(),
      true,
      true,
      UserType.LOCATAIRE
    );

    mockUserRepository.findById.mockResolvedValue(mockUser);

    const result = await useCase.execute(userId);

    expect(result).toBeInstanceOf(User);
    expect(result.id).toBe(userId);
    expect(result.email.getValue()).toBe('test@example.com');
    expect(result.nom).toBe('Doe');
    expect(result.prenom).toBe('John');
    expect(result.telephone).toBe('+241123456789');
    expect(result.photoProfil).toBeNull();
    expect(result.typeUtilisateur).toBe(UserType.LOCATAIRE);
    expect(result.estActif).toBe(true);
    expect(result.estVerifie).toBe(true);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(userId);
  });

  it('should throw ApiError when user does not exist', async () => {
    const userId = 'non-existent';
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(userId)).rejects.toThrow(ApiError);
    await expect(useCase.execute(userId)).rejects.toThrow('Utilisateur');
  });

  it('should throw ApiError when user is not a locataire', async () => {
    const userId = 'user-123';
    const mockUser = new User(
      userId,
      new Email('test@example.com'),
      await Password.create('Password123!'),
      'Doe',
      'John',
      '+241123456789',
      null,
      new Date(),
      true,
      true,
      UserType.PROPRIETAIRE
    );

    mockUserRepository.findById.mockResolvedValue(mockUser);

    await expect(useCase.execute(userId)).rejects.toThrow(ApiError);
    await expect(useCase.execute(userId)).rejects.toThrow('Accès refusé');
  });
});
