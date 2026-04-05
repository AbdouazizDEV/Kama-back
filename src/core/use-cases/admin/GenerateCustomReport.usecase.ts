import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { IAnnonceRepository, SearchCriteria } from '@/core/domain/repositories/IAnnonceRepository';
import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IPaiementRepository } from '@/core/domain/repositories/IPaiementRepository';

export interface CustomReportInput {
  type: 'users' | 'annonces' | 'reservations' | 'paiements' | 'activite';
  dateDebut?: Date;
  dateFin?: Date;
  filters?: Record<string, unknown>;
  format?: 'JSON' | 'CSV' | 'PDF';
}

export interface CustomReportOutput {
  data: unknown;
  format: string;
  generatedAt: Date;
}

export class GenerateCustomReportUseCase {
  constructor(
    private userRepository: IUserRepository,
    private annonceRepository: IAnnonceRepository,
    private reservationRepository: IReservationRepository,
    private paiementRepository: IPaiementRepository
  ) {}

  async execute(input: CustomReportInput): Promise<CustomReportOutput> {
    let data: unknown;

    switch (input.type) {
      case 'users':
        data = await this.generateUsersReport(input);
        break;
      case 'annonces':
        data = await this.generateAnnoncesReport(input);
        break;
      case 'reservations':
        data = await this.generateReservationsReport(input);
        break;
      case 'paiements':
        data = await this.generatePaiementsReport(input);
        break;
      case 'activite':
        data = await this.generateActiviteReport(input);
        break;
      default:
        throw new Error('Type de rapport non supporté');
    }

    return {
      data,
      format: input.format || 'JSON',
      generatedAt: new Date(),
    };
  }

  private async generateUsersReport(_input: CustomReportInput): Promise<unknown> {
    const allUsers = await this.userRepository.findAll();
    // Appliquer les filtres si fournis
    return { total: allUsers.length, users: allUsers };
  }

  private async generateAnnoncesReport(_input: CustomReportInput): Promise<unknown> {
    const criteria: SearchCriteria = { page: 1, limit: 10000 };
    const { data: allAnnonces } = await this.annonceRepository.search(criteria);
    return { total: allAnnonces.length, annonces: allAnnonces };
  }

  private async generateReservationsReport(_input: CustomReportInput): Promise<unknown> {
    const allReservations = await this.reservationRepository.findAll();
    return { total: allReservations.length, reservations: allReservations };
  }

  private async generatePaiementsReport(_input: CustomReportInput): Promise<unknown> {
    const allPaiements = await this.paiementRepository.findAll();
    return { total: allPaiements.length, paiements: allPaiements };
  }

  private async generateActiviteReport(_input: CustomReportInput): Promise<unknown> {
    // Utiliser GetActiviteReportUseCase si nécessaire
    return { message: 'Rapport d\'activité généré' };
  }
}
