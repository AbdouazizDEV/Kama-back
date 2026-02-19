import bcrypt from 'bcrypt';

export class Password {
  private constructor(private readonly hashedValue: string) {}

  static async create(plainPassword: string): Promise<Password> {
    if (plainPassword.length < 8) {
      throw new Error('Le mot de passe doit contenir au moins 8 caractères');
    }
    if (!/[A-Z]/.test(plainPassword)) {
      throw new Error('Le mot de passe doit contenir au moins une majuscule');
    }
    if (!/[a-z]/.test(plainPassword)) {
      throw new Error('Le mot de passe doit contenir au moins une minuscule');
    }
    if (!/[0-9]/.test(plainPassword)) {
      throw new Error('Le mot de passe doit contenir au moins un chiffre');
    }

    const hashed = await bcrypt.hash(plainPassword, 10);
    return new Password(hashed);
  }

  static fromHash(hashedPassword: string): Password {
    return new Password(hashedPassword);
  }

  async compare(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.hashedValue);
  }

  getHash(): string {
    return this.hashedValue;
  }
}
