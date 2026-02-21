import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🧪 Création d\'un utilisateur étudiant pour les tests...\n');

  // Créer ou mettre à jour un utilisateur étudiant
  const hashedPassword = await bcrypt.hash('Password123!', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'etudiant.test@gmail.com' },
    update: {
      typeUtilisateur: 'ETUDIANT',
      estActif: true,
      estVerifie: true,
    },
    create: {
      email: 'etudiant.test@gmail.com',
      password: hashedPassword,
      nom: 'Etudiant',
      prenom: 'Test',
      telephone: '+241062345999',
      typeUtilisateur: 'ETUDIANT',
      estActif: true,
      estVerifie: true,
    },
  });

  console.log('✅ Utilisateur étudiant créé/mis à jour:', user.id);
  console.log('   Email:', user.email);
  console.log('   Type:', user.typeUtilisateur);
  console.log('');

  // Créer un profil étudiant
  const etudiant = await prisma.etudiant.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      universite: 'Université Omar Bongo',
      filiere: 'Informatique',
      niveauEtude: 'L3',
      statutVerification: 'EN_ATTENTE',
    },
  });

  console.log('✅ Profil étudiant créé:', etudiant.id);
  console.log('   Université:', etudiant.universite);
  console.log('   Filière:', etudiant.filiere);
  console.log('   Niveau:', etudiant.niveauEtude);
  console.log('');

  // Créer une mutuelle pour l'étudiant
  const mutuelle = await prisma.mutuelle.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      numeroAdhesion: `MUT-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      estActive: true,
    },
  });

  console.log('✅ Mutuelle créée:', mutuelle.id);
  console.log('   Numéro d\'adhésion:', mutuelle.numeroAdhesion);
  console.log('');

  // Créer quelques cotisations
  const now = new Date();
  const cotisations = [];
  for (let i = 0; i < 3; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const cotisation = await prisma.cotisation.upsert({
      where: {
        mutuelleId_mois_annee: {
          mutuelleId: mutuelle.id,
          mois: date.getMonth() + 1,
          annee: date.getFullYear(),
        },
      },
      update: {},
      create: {
        mutuelleId: mutuelle.id,
        montant: 5000,
        mois: date.getMonth() + 1,
        annee: date.getFullYear(),
        statut: i === 0 ? 'PAYEE' : 'EN_ATTENTE',
        datePaiement: i === 0 ? new Date() : null,
      },
    });
    cotisations.push(cotisation);
  }

  console.log(`✅ ${cotisations.length} cotisations créées`);
  console.log('');

  // Créer une annonce avec colocation
  const proprietaire = await prisma.user.findFirst({
    where: { typeUtilisateur: 'PROPRIETAIRE' },
  });

  if (proprietaire) {
    const annonce = await prisma.annonce.create({
      data: {
        proprietaireId: proprietaire.id,
        titre: 'Colocation étudiante - Libreville',
        description: 'Chambre disponible dans une colocation étudiante proche de l\'université',
        typeBien: 'APPARTEMENT',
        categorieBien: 'T3',
        prix: 50000,
        caution: 100000,
        ville: 'Libreville',
        quartier: 'Mont-Bouët',
        adresseComplete: '123 Avenue de l\'Université, Mont-Bouët',
        latitude: 0.3901,
        longitude: 9.4544,
        superficie: 80,
        nombrePieces: 3,
        estMeuble: true,
        equipements: ['Climatisation', 'Électricité', 'Eau courante', 'Internet', 'Logement étudiant'],
        photos: [],
        estDisponible: true,
        dateDisponibilite: new Date(),
        statutModeration: 'APPROUVE',
      },
    });

    const colocation = await prisma.colocation.create({
      data: {
        annonceId: annonce.id,
        nombrePlaces: 3,
        placesDisponibles: 1,
        description: 'Colocation conviviale pour étudiants',
        regles: ['Pas de fête', 'Respect du calme', 'Participation aux charges'],
        estActive: true,
      },
    });

    console.log('✅ Annonce avec colocation créée:', annonce.id);
    console.log('   Colocation:', colocation.id);
    console.log('   Places disponibles:', colocation.placesDisponibles);
    console.log('');
  }

  console.log('✅ Données de test créées avec succès !');
  console.log('');
  console.log('📝 Informations de connexion:');
  console.log('   Email: etudiant.test@gmail.com');
  console.log('   Password: Password123!');
  console.log('');
  console.log('🧪 Vous pouvez maintenant tester les endpoints avec ces identifiants.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
