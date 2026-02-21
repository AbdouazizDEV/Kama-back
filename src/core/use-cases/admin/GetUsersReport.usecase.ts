import { IUserRepository } from '@/core/domain/repositories/IUserRepository';

export interface UsersReport {
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
  activiteParMois: Array<{
    mois: string;
    nouveaux: number;
    actifs: number;
  }>;
}

export class GetUsersReportUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(): Promise<UsersReport> {
    const allUsers = await this.userRepository.findAll();

    const total = allUsers.length;
    const locataires = allUsers.filter((u) => u.typeUtilisateur === 'LOCATAIRE').length;
    const proprietaires = allUsers.filter((u) => u.typeUtilisateur === 'PROPRIETAIRE').length;
    const etudiants = allUsers.filter((u) => u.typeUtilisateur === 'ETUDIANT').length;
    const admins = allUsers.filter((u) => u.typeUtilisateur === 'ADMIN').length;

    const actifs = allUsers.filter((u) => u.estActif).length;
    const inactifs = total - actifs;
    const verifies = allUsers.filter((u) => u.estVerifie).length;
    const nonVerifies = total - verifies;

    const inscriptionsParMois = this.groupInscriptionsByMonth(allUsers);
    const activiteParMois = this.groupActivityByMonth(allUsers);

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
      activiteParMois,
    };
  }

  private groupInscriptionsByMonth(users: any[]): Array<{ mois: string; count: number }> {
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

  private groupActivityByMonth(users: any[]): Array<{ mois: string; nouveaux: number; actifs: number }> {
    const grouped = new Map<string, { nouveaux: number; actifs: number }>();

    users.forEach((user) => {
      const date = new Date(user.dateInscription);
      const mois = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const existing = grouped.get(mois) || { nouveaux: 0, actifs: 0 };
      grouped.set(mois, {
        nouveaux: existing.nouveaux + 1,
        actifs: existing.actifs + (user.estActif ? 1 : 0),
      });
    });

    return Array.from(grouped.entries())
      .map(([mois, data]) => ({ mois, ...data }))
      .sort((a, b) => a.mois.localeCompare(b.mois));
  }
}
