#!/usr/bin/env ts-node
/**
 * Script pour tester la connexion à Supabase
 * Usage: npx ts-node scripts/check-db-connection.ts
 */

import { supabase } from '../src/config/supabase.config';
import { validateEnv } from '../src/config/env.config';

async function checkConnection(): Promise<void> {
  console.log('🔍 Vérification de la connexion à Supabase...\n');

  // 1. Vérifier les variables d'environnement
  console.log('1️⃣ Vérification des variables d\'environnement...');
  try {
    validateEnv();
    console.log('   ✅ Variables d\'environnement configurées\n');
  } catch (error) {
    console.error('   ❌ Erreur:', (error as Error).message);
    console.error('   💡 Vérifiez votre fichier .env.local\n');
    process.exit(1);
  }

  // 2. Tester la connexion Supabase
  console.log('2️⃣ Test de connexion à Supabase...');
  try {
    const { error } = await supabase.from('users').select('count').limit(0);

    if (error) {
      console.error('   ❌ Erreur de connexion:', error.message);
      if (error.code === 'PGRST116') {
        console.error('   💡 La table "users" n\'existe pas encore.');
        console.error('   💡 Exécutez: npx prisma migrate dev\n');
      }
      process.exit(1);
    }

    console.log('   ✅ Connexion à Supabase réussie\n');
  } catch (error) {
    console.error('   ❌ Erreur:', (error as Error).message);
    process.exit(1);
  }

  // 3. Vérifier l'existence des tables principales
  console.log('3️⃣ Vérification des tables...');
  const tables = ['users', 'annonces', 'reservations', 'paiements', 'messages'];

  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(0);
      if (error) {
        console.log(`   ⚠️  Table "${table}" n'existe pas encore`);
      } else {
        console.log(`   ✅ Table "${table}" existe`);
      }
    } catch (error) {
      console.log(`   ⚠️  Table "${table}" n'existe pas encore`);
    }
  }

  console.log('\n✅ Vérification terminée!');
  console.log('\n📝 Prochaines étapes:');
  console.log('   1. Si des tables manquent: npx prisma migrate dev');
  console.log('   2. Testez l\'endpoint: GET /api/test-db');
  console.log('   3. Vérifiez la documentation: GET /api/swagger\n');
}

// Exécuter le script
checkConnection().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
