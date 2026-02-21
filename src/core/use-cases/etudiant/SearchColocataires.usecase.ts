import { IColocationRepository } from '@/core/domain/repositories/IColocationRepository';
import { IEtudiantRepository } from '@/core/domain/repositories/IEtudiantRepository';
import { IUserRepository } from '@/core/domain/repositories/IUserRepository';
import { ApiError } from '@/shared/utils/ApiError';
import { UserType } from '@/core/domain/entities/User.entity';

export interface SearchColocatairesCriteria {
  universite?: string;
  filiere?: string;
  niveauEtude?: string;
  page?: number;
  limit?: number;
}

export class SearchColocatairesUseCase {
  constructor(
    private colocationRepository: IColocationRepository,
    private etudiantRepository: IEtudiantRepository,
    private userRepository: IUserRepository
  ) {}

  async execute(userId: string, criteria: SearchColocatairesCriteria) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw ApiError.notFound('Utilisateur');
    }

    if (user.typeUtilisateur !== UserType.ETUDIANT) {
      throw ApiError.forbidden('Accès réservé aux étudiants');
    }

    // Récupérer les colocations actives
    const colocations = await this.colocationRepository.findActive();

    // Filtrer par critères de compatibilité
    const compatibleColocations = await Promise.all(
      colocations.map(async (colocation) => {
        // Récupérer les candidatures acceptées pour cette colocation
        const candidatures = await this.colocationRepository.findCandidaturesByColocationId(
          colocation.id
        );
        const candidatsAcceptes = candidatures.filter((c) => c.isAccepted());

        // Récupérer les profils des candidats acceptés
        const profilsCandidats = await Promise.all(
          candidatsAcceptes.map(async (candidature) => {
            const candidat = await this.userRepository.findById(candidature.candidatId);
            const etudiant = candidat
              ? await this.etudiantRepository.findByUserId(candidat.id)
              : null;

            return {
              userId: candidature.candidatId,
              nom: candidat?.nom,
              prenom: candidat?.prenom,
              universite: etudiant?.universite,
              filiere: etudiant?.filiere,
              niveauEtude: etudiant?.niveauEtude,
            };
          })
        );

        // Filtrer par critères
        let isCompatible = true;
        if (criteria.universite) {
          isCompatible = profilsCandidats.some(
            (p) => p.universite === criteria.universite
          );
        }
        if (criteria.filiere) {
          isCompatible = isCompatible && profilsCandidats.some(
            (p) => p.filiere === criteria.filiere
          );
        }

        return {
          colocationId: colocation.id,
          annonceId: colocation.annonceId,
          placesDisponibles: colocation.placesDisponibles,
          candidats: profilsCandidats,
          isCompatible,
        };
      })
    );

    const filtered = compatibleColocations.filter((c) => c.isCompatible);
    const page = criteria.page || 1;
    const limit = criteria.limit || 20;
    const start = (page - 1) * limit;
    const end = start + limit;

    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      limit,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }
}
