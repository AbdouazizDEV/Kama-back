import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { randomUUID } from 'crypto';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createReservationTerminee() {
  const proprietaireId = 'ddd1fe08-5b28-4901-8c4a-6fbd4a338023';
  
  // Récupérer ou créer un locataire
  const { data: existingDbUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'locataire.test.proprietaire@gmail.com')
    .single();

  let locataireId: string;
  if (existingDbUser) {
    locataireId = existingDbUser.id;
  } else {
    console.error('❌ Locataire non trouvé');
    process.exit(1);
  }

  // Créer une annonce approuvée
  const annonceId = randomUUID();
  const { error: annonceError } = await supabase
    .from('annonces')
    .insert({
      id: annonceId,
      proprietaireId: proprietaireId,
      titre: 'Appartement Test Terminé',
      description: 'Appartement de test pour tester la restitution de caution. Description complète avec tous les détails nécessaires.',
      typeBien: 'APPARTEMENT',
      categorieBien: 'T2',
      prix: 100000,
      caution: 200000,
      ville: 'Libreville',
      quartier: 'Mont-Bouët',
      adresseComplete: '123 Test Street',
      estMeuble: false,
      equipements: ['Climatisation'],
      photos: ['https://example.com/photo.jpg'],
      estDisponible: true,
      dateDisponibilite: new Date().toISOString(),
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString(),
      statutModeration: 'APPROUVE',
      nombreVues: 0,
    });

  if (annonceError) {
    console.error('❌ Erreur lors de la création de l\'annonce:', annonceError);
    process.exit(1);
  }

  // Créer une réservation avec dates futures, puis la marquer comme terminée
  const dateDebut = new Date();
  dateDebut.setDate(dateDebut.getDate() + 1); // Demain
  const dateFin = new Date(dateDebut);
  dateFin.setDate(dateFin.getDate() + 30); // Dans 30 jours

  const reservationId = randomUUID();
  const { error: reservationError } = await supabase
    .from('reservations')
    .insert({
      id: reservationId,
      annonceId: annonceId,
      locataireId: locataireId,
      proprietaireId: proprietaireId,
      dateDebut: dateDebut.toISOString(),
      dateFin: dateFin.toISOString(),
      nombrePersonnes: 2,
      prixTotal: 100000 * 30,
      caution: 200000,
      message: 'Réservation terminée de test',
      statut: 'ACCEPTEE', // D'abord acceptée
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString(),
    });

  if (reservationError) {
    console.error('❌ Erreur lors de la création de la réservation:', reservationError);
    process.exit(1);
  }

  // Marquer comme terminée (en modifiant directement dans la DB car la validation empêche les dates passées)
  const { error: updateError } = await supabase
    .from('reservations')
    .update({ statut: 'TERMINEE' })
    .eq('id', reservationId);

  if (updateError) {
    console.error('❌ Erreur lors de la mise à jour du statut:', updateError);
    process.exit(1);
  }

  console.log('✅ Réservation terminée créée:', reservationId);
  console.log('📋 Réservation ID:', reservationId);
}

createReservationTerminee()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
