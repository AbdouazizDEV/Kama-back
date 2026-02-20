import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Charger les variables d'environnement
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function approveTestAnnonces() {
  console.log('🔄 Approbation des annonces de test...\n');

  try {
    // Récupérer toutes les annonces en attente (utiliser Prisma avec camelCase)
    const annonces = await prisma.annonce.findMany({
      where: {
        statutModeration: 'EN_ATTENTE',
      },
      take: 10,
      select: {
        id: true,
        titre: true,
      },
    });

    if (annonces.length === 0) {
      console.log('ℹ️  Aucune annonce en attente trouvée.');
      return;
    }

    console.log(`📋 ${annonces.length} annonce(s) trouvée(s) :\n`);

    // Approuver les annonces
    let approvedCount = 0;
    for (const annonce of annonces) {
      await prisma.annonce.update({
        where: { id: annonce.id },
        data: {
          statutModeration: 'APPROUVE',
          estDisponible: true,
        },
      });

      console.log(`  ✅ ${annonce.titre.substring(0, 50)}...`);
      approvedCount++;
    }

    console.log(`\n🎉 ${approvedCount} annonce(s) approuvée(s) avec succès !`);
    console.log('\n📊 Résumé :');
    console.log(`   - Annonces approuvées : ${approvedCount}`);
    console.log(`   - Statut : APPROUVE`);
    console.log(`   - Disponibilité : true`);
    console.log('\n💡 Vous pouvez maintenant tester les endpoints publics :');
    console.log('   - GET /api/public/annonces');
    console.log('   - GET /api/public/annonces/featured');
    console.log('   - GET /api/public/annonces/recent');
  } catch (error) {
    console.error('❌ Erreur lors de l\'approbation des annonces:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

approveTestAnnonces()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
