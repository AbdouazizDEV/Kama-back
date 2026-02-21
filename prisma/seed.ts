import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Villes et quartiers du Gabon
const villesGabon = [
  {
    ville: 'Libreville',
    quartiers: ['Akanda', 'Angondjé', 'Awendjé', 'Baraka', 'Batterie IV', 'Charbonnages', 'Cocotiers', 'Derrière-Gare', 'Gros-Bouquet', 'Louis', 'Mont-Bouët', 'Nkembo', 'Oloumi', 'Quartier Louis', 'Sotega'],
  },
  {
    ville: 'Port-Gentil',
    quartiers: ['Aéroport', 'Bordamur', 'Cité des Pêcheurs', 'Délices', 'Fougamou', 'Ibeka', 'Lambaréné', 'Nzeng-Ayong', 'Port-Gentil Centre', 'Sable'],
  },
  {
    ville: 'Franceville',
    quartiers: ['Boué', 'Centre-ville', 'Mounana', 'Okondja', 'Ovan'],
  },
  {
    ville: 'Oyem',
    quartiers: ['Centre-ville', 'Mitzic', 'Ndjolé'],
  },
  {
    ville: 'Moanda',
    quartiers: ['Centre-ville', 'Mounana'],
  },
];

// Types de biens
const typesBiens = ['APPARTEMENT', 'MAISON', 'TERRAIN', 'VEHICULE'];
const categoriesBiens = {
  APPARTEMENT: ['Studio', 'T2', 'T3', 'T4', 'T5+'],
  MAISON: ['Villa', 'Maison traditionnelle', 'Maison moderne'],
  TERRAIN: ['Terrain constructible', 'Terrain agricole', 'Terrain commercial'],
  VEHICULE: ['Voiture', 'Moto', 'Vélo', 'Camion'],
};

// Équipements possibles
const equipements = [
  'Climatisation',
  'Électricité',
  'Eau courante',
  'Internet',
  'Parking',
  'Jardin',
  'Piscine',
  'Sécurité',
  'Meublé',
  'Cuisine équipée',
];

async function main() {
  console.log('🌱 Début du seeding...\n');

  // Nettoyer la base de données
  console.log('🧹 Nettoyage de la base de données...');
  await prisma.favori.deleteMany();
  await prisma.message.deleteMany();
  await prisma.paiement.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.annonce.deleteMany();
  await prisma.user.deleteMany();
  console.log('✅ Base de données nettoyée\n');

  // Créer des utilisateurs
  console.log('👥 Création des utilisateurs...');
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const users = [
    // Administrateur
    {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@kama.ga',
      password: hashedPassword,
      nom: 'Admin',
      prenom: 'Kama',
      telephone: '+241062345678',
      typeUtilisateur: 'ADMIN',
      estActif: true,
      estVerifie: true,
    },
    // Propriétaires
    {
      id: '00000000-0000-0000-0000-000000000002',
      email: 'jean.dupont@example.com',
      password: hashedPassword,
      nom: 'Dupont',
      prenom: 'Jean',
      telephone: '+241062345679',
      typeUtilisateur: 'PROPRIETAIRE',
      estActif: true,
      estVerifie: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000003',
      email: 'marie.martin@example.com',
      password: hashedPassword,
      nom: 'Martin',
      prenom: 'Marie',
      telephone: '+241062345680',
      typeUtilisateur: 'PROPRIETAIRE',
      estActif: true,
      estVerifie: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000004',
      email: 'pierre.bernard@example.com',
      password: hashedPassword,
      nom: 'Bernard',
      prenom: 'Pierre',
      telephone: '+241062345681',
      typeUtilisateur: 'PROPRIETAIRE',
      estActif: true,
      estVerifie: true,
    },
    // Locataires
    {
      id: '00000000-0000-0000-0000-000000000005',
      email: 'sophie.durand@example.com',
      password: hashedPassword,
      nom: 'Durand',
      prenom: 'Sophie',
      telephone: '+241062345682',
      typeUtilisateur: 'LOCATAIRE',
      estActif: true,
      estVerifie: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000006',
      email: 'paul.leroy@example.com',
      password: hashedPassword,
      nom: 'Leroy',
      prenom: 'Paul',
      telephone: '+241062345683',
      typeUtilisateur: 'LOCATAIRE',
      estActif: true,
      estVerifie: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000007',
      email: 'lucie.moreau@example.com',
      password: hashedPassword,
      nom: 'Moreau',
      prenom: 'Lucie',
      telephone: '+241062345684',
      typeUtilisateur: 'LOCATAIRE',
      estActif: true,
      estVerifie: true,
    },
    // Étudiants
    {
      id: '00000000-0000-0000-0000-000000000008',
      email: 'thomas.petit@example.com',
      password: hashedPassword,
      nom: 'Petit',
      prenom: 'Thomas',
      telephone: '+241062345685',
      typeUtilisateur: 'ETUDIANT',
      estActif: true,
      estVerifie: true,
    },
    {
      id: '00000000-0000-0000-0000-000000000009',
      email: 'emma.robert@example.com',
      password: hashedPassword,
      nom: 'Robert',
      prenom: 'Emma',
      telephone: '+241062345686',
      typeUtilisateur: 'ETUDIANT',
      estActif: true,
      estVerifie: true,
    },
  ];

  for (const userData of users) {
    await prisma.user.create({
      data: userData,
    });
  }
  console.log(`✅ ${users.length} utilisateurs créés\n`);

  // Créer des annonces
  console.log('🏠 Création des annonces...');
  const proprietaires = users.filter((u) => u.typeUtilisateur === 'PROPRIETAIRE');
  const annonces = [];

  for (let i = 0; i < 30; i++) {
    const villeData = villesGabon[Math.floor(Math.random() * villesGabon.length)];
    const quartier = villeData.quartiers[Math.floor(Math.random() * villeData.quartiers.length)];
    const typeBien = typesBiens[Math.floor(Math.random() * typesBiens.length)];
    const categorie = categoriesBiens[typeBien as keyof typeof categoriesBiens][
      Math.floor(Math.random() * categoriesBiens[typeBien as keyof typeof categoriesBiens].length)
    ];
    const proprietaire = proprietaires[Math.floor(Math.random() * proprietaires.length)];

    // Prix selon le type de bien
    let prix = 0;
    let caution = 0;
    let superficie = null as number | null;
    let nombrePieces = null as number | null;

    if (typeBien === 'APPARTEMENT') {
      prix = Math.floor(Math.random() * 200000) + 50000; // 50 000 - 250 000 FCFA
      caution = Math.floor(prix * 0.3);
      superficie = Math.floor(Math.random() * 50) + 30; // 30-80 m²
      nombrePieces = Math.floor(Math.random() * 3) + 1; // 1-4 pièces
    } else if (typeBien === 'MAISON') {
      prix = Math.floor(Math.random() * 500000) + 100000; // 100 000 - 600 000 FCFA
      caution = Math.floor(prix * 0.3);
      superficie = Math.floor(Math.random() * 150) + 50; // 50-200 m²
      nombrePieces = Math.floor(Math.random() * 5) + 2; // 2-7 pièces
    } else if (typeBien === 'TERRAIN') {
      prix = Math.floor(Math.random() * 10000000) + 500000; // 500 000 - 10 500 000 FCFA
      caution = 0;
      superficie = Math.floor(Math.random() * 1000) + 200; // 200-1200 m²
    } else if (typeBien === 'VEHICULE') {
      prix = Math.floor(Math.random() * 500000) + 50000; // 50 000 - 550 000 FCFA
      caution = Math.floor(prix * 0.2);
    }

    // Équipements aléatoires
    const nbEquipements = Math.floor(Math.random() * 5) + 2;
    const selectedEquipements = equipements
      .sort(() => 0.5 - Math.random())
      .slice(0, nbEquipements);

    const estMeuble = selectedEquipements.includes('Meublé');
    // S'assurer qu'au moins 20 annonces sont disponibles et approuvées pour les tests
    const estDisponible = i < 20 || Math.random() > 0.3; // 70% disponibles
    const statutModeration = i < 20 ? 'APPROUVE' : (estDisponible
      ? ['EN_ATTENTE', 'APPROUVE'][Math.floor(Math.random() * 2)]
      : 'EN_ATTENTE');

    const dateDisponibilite = new Date();
    dateDisponibilite.setDate(dateDisponibilite.getDate() + Math.floor(Math.random() * 30));

    const annonce = await prisma.annonce.create({
      data: {
        proprietaireId: proprietaire.id,
        titre: `${typeBien} - ${categorie} à ${quartier}, ${villeData.ville}`,
        description: `Magnifique ${categorie.toLowerCase()} ${typeBien.toLowerCase()} situé dans le quartier ${quartier} à ${villeData.ville}. ${selectedEquipements.join(', ')}. Idéal pour ${typeBien === 'APPARTEMENT' || typeBien === 'MAISON' ? 'une famille' : typeBien === 'VEHICULE' ? 'vos déplacements' : 'votre projet'}.`,
        typeBien,
        categorieBien: categorie,
        prix,
        caution,
        ville: villeData.ville,
        quartier,
        adresseComplete: `${Math.floor(Math.random() * 200) + 1} Avenue ${quartier}, ${villeData.ville}`,
        latitude: 0.4 + Math.random() * 0.2, // Approximatif pour le Gabon
        longitude: 9.3 + Math.random() * 0.2,
        superficie,
        nombrePieces,
        estMeuble,
        equipements: selectedEquipements,
        photos: [],
        estDisponible,
        dateDisponibilite,
        nombreVues: Math.floor(Math.random() * 500),
        statutModeration,
      },
    });

    annonces.push(annonce);
  }
  console.log(`✅ ${annonces.length} annonces créées\n`);

  // Créer des réservations
  console.log('📅 Création des réservations...');
  const locataires = users.filter((u) => u.typeUtilisateur === 'LOCATAIRE' || u.typeUtilisateur === 'ETUDIANT');
  const annoncesDisponibles = annonces.filter((a) => a.estDisponible && a.statutModeration === 'APPROUVE');
  const reservations = [];

  // Créer des réservations avec différents statuts pour les tests
  const statuts = ['EN_ATTENTE', 'ACCEPTEE', 'REJETEE', 'TERMINEE', 'ANNULEE'];
  
  for (let i = 0; i < 15; i++) {
    if (annoncesDisponibles.length === 0) break;

    const annonce = annoncesDisponibles[Math.floor(Math.random() * annoncesDisponibles.length)];
    const locataire = locataires[Math.floor(Math.random() * locataires.length)];

    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() + Math.floor(Math.random() * 30) + 7);
    const dateFin = new Date(dateDebut);
    dateFin.setDate(dateFin.getDate() + Math.floor(Math.random() * 30) + 7);

    const nombreJours = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24));
    // Limiter le prixTotal pour éviter le dépassement (max 99,999,999.99)
    const prixJournalier = Number(annonce.prix);
    const prixTotal = Math.min(prixJournalier * nombreJours, 99999999.99);
    // S'assurer d'avoir au moins une réservation de chaque statut
    const statut = i < statuts.length ? statuts[i] : statuts[Math.floor(Math.random() * statuts.length)];

    const reservation = await prisma.reservation.create({
      data: {
        annonceId: annonce.id,
        locataireId: locataire.id,
        proprietaireId: annonce.proprietaireId,
        dateDebut,
        dateFin,
        nombrePersonnes: Math.floor(Math.random() * 4) + 1,
        prixTotal,
        caution: Number(annonce.caution),
        message: `Bonjour, je souhaite réserver ce bien du ${dateDebut.toLocaleDateString('fr-FR')} au ${dateFin.toLocaleDateString('fr-FR')}.`,
        statut,
      },
    });

    reservations.push(reservation);
  }
  console.log(`✅ ${reservations.length} réservations créées\n`);

  // Créer des favoris
  console.log('⭐ Création des favoris...');
  let favorisCount = 0;
  for (let i = 0; i < 15; i++) {
    const user = locataires[Math.floor(Math.random() * locataires.length)];
    const annonce = annoncesDisponibles[Math.floor(Math.random() * annoncesDisponibles.length)];

    try {
      await prisma.favori.create({
        data: {
          userId: user.id,
          annonceId: annonce.id,
        },
      });
      favorisCount++;
    } catch (error) {
      // Ignorer les doublons
    }
  }
  console.log(`✅ ${favorisCount} favoris créés\n`);

  // Créer des paiements
  console.log('💳 Création des paiements...');
  const paiements = [];
  const reservationsAvecPaiement = reservations.filter((r) => 
    r.statut === 'ACCEPTEE' || r.statut === 'TERMINEE'
  );
  const methodesPaiement = ['AIRTEL_MONEY', 'MOOV_MONEY', 'STRIPE', 'ESPECE'];
  const statutsPaiement = ['EN_ATTENTE', 'VALIDE', 'ECHOUE', 'REMBOURSE'];

  for (let i = 0; i < Math.min(10, reservationsAvecPaiement.length); i++) {
    const reservation = reservationsAvecPaiement[i];
    const methode = methodesPaiement[Math.floor(Math.random() * methodesPaiement.length)];
    const statut = statutsPaiement[Math.floor(Math.random() * statutsPaiement.length)];
    
    // Créer différents types de paiements
    const typesPaiement = ['CAUTION', 'LOYER', 'FRAIS'];
    const typePaiement = typesPaiement[Math.floor(Math.random() * typesPaiement.length)];
    
    let montant = 0;
    if (typePaiement === 'CAUTION') {
      montant = Number(reservation.caution);
    } else if (typePaiement === 'LOYER') {
      montant = Number(reservation.prixTotal);
    } else {
      montant = Math.floor(Math.random() * 50000) + 10000; // Frais divers
    }

    const paiement = await prisma.paiement.create({
      data: {
        reservationId: reservation.id,
        locataireId: reservation.locataireId,
        proprietaireId: reservation.proprietaireId,
        montant,
        methodePaiement: methode,
        statut,
        referenceTransaction: statut === 'VALIDE' ? `TXN-${Date.now()}-${i}` : null,
        dateValidation: statut === 'VALIDE' ? new Date() : null,
      },
    });

    paiements.push(paiement);
  }
  console.log(`✅ ${paiements.length} paiements créés\n`);

  // Créer des messages
  console.log('💬 Création des messages...');
  let messagesCount = 0;
  for (let i = 0; i < Math.min(20, reservations.length); i++) {
    const reservation = reservations[i];
    
    // Créer plusieurs messages par réservation (conversation)
    const nbMessages = Math.floor(Math.random() * 5) + 2; // 2-6 messages
    
    for (let j = 0; j < nbMessages; j++) {
      // Alterner entre locataire et propriétaire
      const expediteurId = j % 2 === 0 ? reservation.locataireId : reservation.proprietaireId;
      const destinataireId = j % 2 === 0 ? reservation.proprietaireId : reservation.locataireId;
      
      const contenus = [
        'Bonjour, j\'aimerais avoir plus d\'informations sur cette annonce.',
        'Merci pour votre réponse. Quand pourrais-je visiter le bien ?',
        'Parfait, je suis disponible demain après-midi.',
        'D\'accord, je confirme ma réservation.',
        'Merci beaucoup, à bientôt !',
      ];

      try {
        await prisma.message.create({
          data: {
            reservationId: reservation.id,
            expediteurId,
            destinataireId,
            contenu: contenus[j % contenus.length] || contenus[0],
            estLu: j < nbMessages - 1, // Les derniers messages ne sont pas lus
            dateLecture: j < nbMessages - 1 ? new Date() : null,
          },
        });
        messagesCount++;
      } catch (error) {
        console.error('Erreur création message:', error);
      }
    }
  }
  console.log(`✅ ${messagesCount} messages créés\n`);

  // Créer des avis
  console.log('⭐ Création des avis...');
  let avisCount = 0;
  const reservationsTerminees = reservations.filter((r) => r.statut === 'TERMINEE');
  
  for (let i = 0; i < Math.min(8, reservationsTerminees.length); i++) {
    const reservation = reservationsTerminees[i];
    
    const commentaires = [
      'Excellent logement, très propre et bien situé. Je recommande !',
      'Très bon séjour, propriétaire très accueillant.',
      'Logement conforme à la description, je suis satisfait.',
      'Bien situé mais un peu bruyant. Dans l\'ensemble correct.',
      'Parfait pour un séjour court, je reviendrai.',
    ];

    try {
      await prisma.avis.create({
        data: {
          reservationId: reservation.id,
          locataireId: reservation.locataireId,
          proprietaireId: reservation.proprietaireId,
          note: Math.floor(Math.random() * 2) + 4, // 4-5 étoiles
          commentaire: commentaires[i % commentaires.length],
        },
      });
      avisCount++;
    } catch (error) {
      // Ignorer les doublons (un avis par réservation)
    }
  }
  console.log(`✅ ${avisCount} avis créés\n`);

  console.log('🎉 Seeding terminé avec succès!');
  console.log('\n📊 Résumé:');
  console.log(`   - ${users.length} utilisateurs`);
  console.log(`   - ${annonces.length} annonces (${annonces.filter(a => a.statutModeration === 'APPROUVE').length} approuvées)`);
  console.log(`   - ${reservations.length} réservations`);
  console.log(`   - ${favorisCount} favoris`);
  console.log(`   - ${paiements.length} paiements`);
  console.log(`   - ${messagesCount} messages`);
  console.log(`   - ${avisCount} avis`);
  console.log('\n🔑 Comptes de test:');
  console.log('   Admin: admin@kama.ga / Password123!');
  console.log('   Propriétaire: jean.dupont@example.com / Password123!');
  console.log('   Locataire: sophie.durand@example.com / Password123!');
  console.log('   Locataire (test): kahficontact1010@gmail.com / Password123!');
  console.log('   Étudiant: thomas.petit@example.com / Password123!');
  console.log('\n💡 Tous les utilisateurs ont le même mot de passe: Password123!');
  console.log('\n✅ Données de test complètes pour tester tous les endpoints locataires !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
