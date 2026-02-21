// Pour l'instant, on retourne une configuration par défaut
// TODO: Implémenter un système de configuration persistant (base de données ou fichier)

export interface SystemConfig {
  [key: string]: any;
}

export class GetSystemConfigUseCase {
  async execute(): Promise<SystemConfig> {
    // Configuration par défaut
    return {
      maintenance: false,
      inscriptionOuverte: true,
      paiementActif: true,
      emailNotifications: true,
      smsNotifications: false,
      tauxCommission: 5, // 5%
      dureeReservationMax: 365, // jours
      dureeReservationMin: 1, // jours
      limiteAnnoncesParProprietaire: 10,
      limitePhotosParAnnonce: 10,
      tailleMaxPhoto: 5242880, // 5MB
      formatsPhotoAcceptes: ['jpg', 'jpeg', 'png', 'webp'],
    };
  }
}
