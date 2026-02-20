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

  for (let i = 0; i < 20; i++) {
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
    const estDisponible = Math.random() > 0.3; // 70% disponibles
    const statutModeration = estDisponible
      ? ['EN_ATTENTE', 'APPROUVE'][Math.floor(Math.random() * 2)]
      : 'EN_ATTENTE';

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

  for (let i = 0; i < 8; i++) {
    if (annoncesDisponibles.length === 0) break;

    const annonce = annoncesDisponibles[Math.floor(Math.random() * annoncesDisponibles.length)];
    const locataire = locataires[Math.floor(Math.random() * locataires.length)];

    const dateDebut = new Date();
    dateDebut.setDate(dateDebut.getDate() + Math.floor(Math.random() * 30) + 7);
    const dateFin = new Date(dateDebut);
    dateFin.setDate(dateFin.getDate() + Math.floor(Math.random() * 30) + 7);

    const nombreJours = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24));
    const prixTotal = Number(annonce.prix) * nombreJours;
    const statut = ['EN_ATTENTE', 'ACCEPTEE', 'REJETEE', 'TERMINEE'][Math.floor(Math.random() * 4)];

    await prisma.reservation.create({
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
  }
  console.log('✅ Réservations créées\n');

  // Créer des favoris
  console.log('⭐ Création des favoris...');
  for (let i = 0; i < 10; i++) {
    const user = locataires[Math.floor(Math.random() * locataires.length)];
    const annonce = annonces[Math.floor(Math.random() * annonces.length)];

    try {
      await prisma.favori.create({
        data: {
          userId: user.id,
          annonceId: annonce.id,
        },
      });
    } catch (error) {
      // Ignorer les doublons
    }
  }
  console.log('✅ Favoris créés\n');

  console.log('🎉 Seeding terminé avec succès!');
  console.log('\n📊 Résumé:');
  console.log(`   - ${users.length} utilisateurs`);
  console.log(`   - ${annonces.length} annonces`);
  console.log(`   - Réservations créées`);
  console.log(`   - Favoris créés`);
  console.log('\n🔑 Comptes de test:');
  console.log('   Admin: admin@kama.ga / Password123!');
  console.log('   Propriétaire: jean.dupont@example.com / Password123!');
  console.log('   Locataire: sophie.durand@example.com / Password123!');
  console.log('   Étudiant: thomas.petit@example.com / Password123!');
  console.log('\n💡 Tous les utilisateurs ont le même mot de passe: Password123!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
