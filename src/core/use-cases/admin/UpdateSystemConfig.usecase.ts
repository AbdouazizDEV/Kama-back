export interface UpdateSystemConfigInput {
  key: string;
  value: any;
}

export class UpdateSystemConfigUseCase {
  async execute(input: UpdateSystemConfigInput): Promise<void> {
    // TODO: Implémenter la persistance de la configuration
    // Pour l'instant, on valide juste les clés
    const validKeys = [
      'maintenance',
      'inscriptionOuverte',
      'paiementActif',
      'emailNotifications',
      'smsNotifications',
      'tauxCommission',
      'dureeReservationMax',
      'dureeReservationMin',
      'limiteAnnoncesParProprietaire',
      'limitePhotosParAnnonce',
      'tailleMaxPhoto',
      'formatsPhotoAcceptes',
    ];

    if (!validKeys.includes(input.key)) {
      throw new Error(`Clé de configuration invalide: ${input.key}`);
    }

    // TODO: Sauvegarder dans la base de données ou un fichier de configuration
  }
}
