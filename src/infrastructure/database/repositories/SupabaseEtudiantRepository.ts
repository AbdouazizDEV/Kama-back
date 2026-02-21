import { IEtudiantRepository } from '@/core/domain/repositories/IEtudiantRepository';
import { Etudiant, StatutVerificationEtudiant } from '@/core/domain/entities/Etudiant.entity';
import { supabase } from '../supabase.client';
import { Email } from '@/core/domain/value-objects/Email.vo';
import { Password } from '@/core/domain/value-objects/Password.vo';

export class SupabaseEtudiantRepository implements IEtudiantRepository {
  async findByUserId(userId: string): Promise<Etudiant | null> {
    const { data, error } = await supabase
      .from('etudiants')
      .select('*')
      .eq('userId', userId)
      .single();

    if (error || !data) return null;

    // Récupérer aussi les données de l'utilisateur
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (!userData) return null;

    return this.mapToEntity(data, userData);
  }

  async save(etudiant: Etudiant): Promise<void> {
    // Générer un ID unique pour l'entité Etudiant
    const { randomUUID } = await import('crypto');
    const etudiantId = randomUUID();
    const now = new Date();
    
    const { error } = await supabase.from('etudiants').insert({
      id: etudiantId,
      userId: etudiant.id, // L'ID de l'utilisateur
      universite: etudiant.universite,
      filiere: etudiant.filiere,
      niveauEtude: etudiant.niveauEtude,
      numeroEtudiant: etudiant.numeroEtudiant,
      statutVerification: etudiant.statutVerification,
      carteEtudianteUrl: etudiant.carteEtudianteUrl,
      attestationInscriptionUrl: etudiant.attestationInscriptionUrl,
      dateVerification: etudiant.dateVerification?.toISOString() || null,
      motifRejet: etudiant.motifRejet,
      dateModification: now.toISOString(),
    });

    if (error) {
      // Si l'étudiant existe déjà, faire un update
      if (error.code === '23505' || error.message.includes('duplicate')) {
        await this.update(etudiant);
        return;
      }
      throw new Error(`Erreur lors de la sauvegarde de l'étudiant: ${error.message}`);
    }
  }

  async update(etudiant: Etudiant): Promise<void> {
    const { error } = await supabase
      .from('etudiants')
      .update({
        universite: etudiant.universite,
        filiere: etudiant.filiere,
        niveauEtude: etudiant.niveauEtude,
        numeroEtudiant: etudiant.numeroEtudiant,
        statutVerification: etudiant.statutVerification,
        carteEtudianteUrl: etudiant.carteEtudianteUrl,
        attestationInscriptionUrl: etudiant.attestationInscriptionUrl,
        dateVerification: etudiant.dateVerification?.toISOString() || null,
        motifRejet: etudiant.motifRejet,
        dateModification: new Date().toISOString(),
      })
      .eq('userId', etudiant.id);

    if (error) {
      throw new Error(`Erreur lors de la mise à jour de l'étudiant: ${error.message}`);
    }
  }

  private mapToEntity(data: any, userData: any): Etudiant {
    const email = new Email(userData.email);
    const password = Password.fromHash(userData.password);

    return new Etudiant(
      data.userId, // L'ID de l'utilisateur
      email,
      password,
      userData.nom,
      userData.prenom,
      userData.telephone,
      userData.photoProfil,
      new Date(userData.dateInscription || userData.date_inscription),
      userData.estActif ?? userData.est_actif ?? true,
      userData.estVerifie ?? userData.est_verifie ?? false,
      null, // dateNaissance
      null, // profession
      null, // revenusMensuels
      data.universite,
      data.filiere,
      data.niveauEtude,
      data.numeroEtudiant,
      (data.statutVerification || 'EN_ATTENTE') as StatutVerificationEtudiant,
      data.carteEtudianteUrl,
      data.attestationInscriptionUrl,
      data.dateVerification ? new Date(data.dateVerification) : null,
      data.motifRejet
    );
  }
}
