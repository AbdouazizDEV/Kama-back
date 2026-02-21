import { IUserRepository, UserFilters } from '@/core/domain/repositories/IUserRepository';

export interface UserStatistics {
  total: number;
  parType: {
    LOCATAIRE: number;
    PROPRIETAIRE: number;
    ETUDIANT: number;
    ADMIN: number;
  };
  actifs: number;
  inactifs: number;
  verifies: number;
  nonVerifies: number;
  inscriptionsParMois: Array<{
    mois: string;
    count: number;
  }>;
}

export class GetUserStatisticsUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<UserStatistics> {
    const total = await this.userRepository.count();

    const locataires = await this.userRepository.count({ typeUtilisateur: 'LOCATAIRE' });
    const proprietaires = await this.userRepository.count({ typeUtilisateur: 'PROPRIETAIRE' });
    const etudiants = await this.userRepository.count({ typeUtilisateur: 'ETUDIANT' });
    const admins = await this.userRepository.count({ typeUtilisateur: 'ADMIN' });

    const actifs = await this.userRepository.count({ estActif: true });
    const inactifs = await this.userRepository.count({ estActif: false });
    const verifies = await this.userRepository.count({ estVerifie: true });
    const nonVerifies = await this.userRepository.count({ estVerifie: false });

    // Pour les inscriptions par mois, on récupère tous les utilisateurs et on groupe
    const allUsers = await this.userRepository.findAll();
    const inscriptionsParMois = this.groupByMonth(allUsers);

    return {
      total,
      parType: {
        LOCATAIRE: locataires,
        PROPRIETAIRE: proprietaires,
        ETUDIANT: etudiants,
        ADMIN: admins,
      },
      actifs,
      inactifs,
      verifies,
      nonVerifies,
      inscriptionsParMois,
    };
  }

  private groupByMonth(users: any[]): Array<{ mois: string; count: number }> {
    const grouped = new Map<string, number>();

    users.forEach((user) => {
      const date = new Date(user.dateInscription);
      const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      grouped.set(mois, (grouped.get(mois) || 0) + 1);
    });

    return Array.from(grouped.entries())
      .map(([mois, count]) => ({ mois, count }))
      .sort((a, b) => a.mois.localeCompare(b.mois));
  }
}
