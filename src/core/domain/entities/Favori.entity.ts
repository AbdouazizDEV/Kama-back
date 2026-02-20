export class Favori {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly annonceId: string,
    public readonly dateAjout: Date
  ) {
    if (!userId || !annonceId) {
      throw new Error('userId et annonceId sont requis');
    }
  }
}
