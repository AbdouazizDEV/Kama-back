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

async function createTestData() {
  const proprietaireId = 'ddd1fe08-5b28-4901-8c4a-6fbd4a338023';
  
  // Créer un locataire de test
  console.log('👤 Création d\'un locataire de test...');
  
  // Vérifier si l'utilisateur existe déjà dans users
  const { data: existingDbUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', 'locataire.test.proprietaire@gmail.com')
    .single();

  let locataireId: string;

  if (existingDbUser) {
    // Utiliser l'utilisateur existant
    locataireId = existingDbUser.id;
    console.log('✅ Utilisation du locataire existant:', locataireId);
  } else {
    // Créer un nouveau locataire
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingLocataire = existingUsers?.users.find((u) => u.email === 'locataire.test.proprietaire@gmail.com');
    if (existingLocataire) {
      await supabase.auth.admin.deleteUser(existingLocataire.id);
    }
    
    const { data: locataireAuth, error: locataireError } = await supabase.auth.admin.createUser({
      email: 'locataire.test.proprietaire@gmail.com',
      password: 'Locataire123!',
      email_confirm: true,
      user_metadata: {
        nom: 'Locataire',
        prenom: 'Test',
        telephone: '+241061234568',
        type_utilisateur: 'LOCATAIRE',
      },
    });

    if (locataireError || !locataireAuth?.user) {
      console.error('❌ Erreur lors de la création du locataire:', locataireError);
      process.exit(1);
    }

    locataireId = locataireAuth.user.id;

    // Attendre un peu pour que Supabase Auth termine
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Créer dans la table users
    const { error: userError } = await supabase.from('users').insert({
      id: locataireId,
      email: 'locataire.test.proprietaire@gmail.com',
      nom: 'Locataire',
      prenom: 'Test',
      telephone: '+241061234568',
      type_utilisateur: 'LOCATAIRE',
      est_actif: true,
      est_verifie: true,
      password: '$2a$10$placeholder',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (userError) {
      console.error('❌ Erreur lors de la création dans users:', userError);
      process.exit(1);
    }

    console.log('✅ Locataire créé:', locataireId);
  }

  // Créer une annonce approuvée
  console.log('🏠 Création d\'une annonce approuvée...');
  const annonceId = randomUUID();
  const { data: annonce, error: annonceError } = await supabase
    .from('annonces')
    .insert({
      id: annonceId,
      proprietaireId: proprietaireId,
      titre: 'Appartement Test pour Réservation',
      description: 'Appartement de test pour tester les réservations. Description complète avec tous les détails nécessaires pour une annonce valide.',
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
    })
    .select()
    .single();

  if (annonceError) {
    console.error('❌ Erreur lors de la création de l\'annonce:', annonceError);
    process.exit(1);
  }

  console.log('✅ Annonce créée:', annonceId);

  // Créer une réservation en attente
  console.log('📅 Création d\'une réservation en attente...');
  const dateDebut = new Date();
  dateDebut.setDate(dateDebut.getDate() + 7);
  const dateFin = new Date(dateDebut);
  dateFin.setDate(dateFin.getDate() + 30);

  const reservationId = randomUUID();
  const { data: reservation, error: reservationError } = await supabase
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
      message: 'Réservation de test',
      statut: 'EN_ATTENTE',
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString(),
    })
    .select()
    .single();

  if (reservationError) {
    console.error('❌ Erreur lors de la création de la réservation:', reservationError);
    process.exit(1);
  }

  console.log('✅ Réservation créée:', reservationId);

  // Créer un paiement en attente
  console.log('💳 Création d\'un paiement en attente...');
  const paiementId = randomUUID();
  const { data: paiement, error: paiementError } = await supabase
    .from('paiements')
    .insert({
      id: paiementId,
      reservationId: reservationId,
      locataireId: locataireId,
      proprietaireId: proprietaireId,
      montant: 100000 * 30,
      methodePaiement: 'AIRTEL_MONEY',
      statut: 'EN_ATTENTE',
      referenceTransaction: 'TEST-' + Date.now(),
      dateCreation: new Date().toISOString(),
      dateModification: new Date().toISOString(),
    })
    .select()
    .single();

  if (paiementError) {
    console.error('❌ Erreur lors de la création du paiement:', paiementError);
    process.exit(1);
  }

  console.log('✅ Paiement créé:', paiementId);

  // Créer un message
  console.log('💬 Création d\'un message...');
  const messageId = randomUUID();
  const { data: message, error: messageError } = await supabase
    .from('messages')
    .insert({
      id: messageId,
      reservationId: reservationId,
      expediteurId: locataireId,
      destinataireId: proprietaireId,
      contenu: 'Message de test du locataire',
      dateEnvoi: new Date().toISOString(),
      estLu: false,
    })
    .select()
    .single();

  if (messageError) {
    console.error('❌ Erreur lors de la création du message:', messageError);
    process.exit(1);
  }

  console.log('✅ Message créé:', messageId);

  console.log('');
  console.log('✅ Données de test créées avec succès!');
  console.log('');
  console.log('📋 IDs créés:');
  console.log('  - Locataire ID:', locataireId);
  console.log('  - Annonce ID:', annonceId);
  console.log('  - Réservation ID:', reservationId);
  console.log('  - Paiement ID:', paiementId);
  console.log('  - Message ID:', messageId);
}

createTestData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
