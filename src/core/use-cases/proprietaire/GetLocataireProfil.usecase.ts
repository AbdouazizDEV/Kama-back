import { IReservationRepository } from '@/core/domain/repositories/IReservationRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export class GetLocataireProfilProprietaireUseCase {
  constructor(
    private reservationRepository: IReservationRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(reservationId: string, proprietaireId: string) {
    const proprietaire = await this.userRepository.findById(proprietaireId);
    if (!proprietaire) {
      throw ApiError.notFound('Utilisateur');
    }
    if (proprietaire.typeUtilisateur !== UserType.PROPRIETAIRE) {
      throw ApiError.forbidden('Accès réservé aux propriétaires');
    }

    const reservation = await this.reservationRepository.findById(reservationId);
    if (!reservation) {
      throw ApiError.notFound('Réservation');
    }

    if (reservation.proprietaireId !== proprietaireId) {
      throw ApiError.forbidden('Vous n\'êtes pas autorisé à consulter cette réservation');
    }

    const locataire = await this.userRepository.findById(reservation.locataireId);
    if (!locataire) {
      throw ApiError.notFound('Locataire');
    }

    return {
      id: locataire.id,
      nom: locataire.nom,
      prenom: locataire.prenom,
      email: locataire.email.getValue(),
      telephone: locataire.telephone,
      photoProfil: locataire.photoProfil,
      estVerifie: locataire.estVerifie,
      dateInscription: locataire.dateInscription,
    };
  }
}
