#!/usr/bin/env ts-node
/**
 * Script pour vérifier que toutes les variables d'environnement sont configurées
 * Usage: npx ts-node scripts/check-env.ts
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'JWT_SECRET',
];

const optionalEnvVars = [
  'JWT_EXPIRES_IN',
  'JWT_REFRESH_EXPIRES_IN',
  'NODE_ENV',
  'API_URL',
  'FRONTEND_URL',
  'SENDGRID_API_KEY',
  'SENDGRID_FROM_EMAIL',
  'AIRTEL_MONEY_API_KEY',
  'MOOV_MONEY_API_KEY',
  'STRIPE_SECRET_KEY',
];

function checkEnv(): void {
  console.log('🔍 Vérification des variables d\'environnement...\n');

  // Charger les variables depuis .env.local
  require('dotenv').config({ path: '.env.local' });

  let allGood = true;
  const missing: string[] = [];
  const present: string[] = [];
  const empty: string[] = [];

  // Vérifier les variables requises
  console.log('📋 Variables REQUISES:');
  for (const varName of requiredEnvVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
      console.log(`   ❌ ${varName} - MANQUANTE`);
      allGood = false;
    } else if (value.includes('xxxxx') || value.includes('VOTRE_') || value.includes('votre_')) {
      empty.push(varName);
      console.log(`   ⚠️  ${varName} - Valeur par défaut (à remplacer)`);
      allGood = false;
    } else {
      present.push(varName);
      const displayValue = varName.includes('KEY') || varName.includes('SECRET') || varName.includes('PASSWORD')
        ? `${value.substring(0, 10)}...`
        : value;
      console.log(`   ✅ ${varName} = ${displayValue}`);
    }
  }

  console.log('\n📋 Variables OPTIONNELLES:');
  for (const varName of optionalEnvVars) {
    const value = process.env[varName];
    if (value) {
      console.log(`   ✅ ${varName} = ${value}`);
    } else {
      console.log(`   ⚪ ${varName} - Non définie (optionnel)`);
    }
  }

  console.log('\n' + '='.repeat(60));

  if (allGood) {
    console.log('✅ Toutes les variables requises sont configurées!\n');
    console.log('📝 Prochaines étapes:');
    console.log('   1. Exécutez: npx prisma migrate dev --name init');
    console.log('   2. Testez la connexion: npm run dev puis GET /api/test-db\n');
  } else {
    console.log('❌ Certaines variables sont manquantes ou non configurées\n');
    
    if (missing.length > 0) {
      console.log('🔴 Variables MANQUANTES:');
      missing.forEach((v) => console.log(`   - ${v}`));
      console.log('');
    }

    if (empty.length > 0) {
      console.log('🟡 Variables à REMPLACER (valeurs par défaut détectées):');
      empty.forEach((v) => console.log(`   - ${v}`));
      console.log('');
    }

    console.log('💡 Instructions:');
    console.log('   1. Copiez .env.example vers .env.local:');
    console.log('      cp .env.example .env.local');
    console.log('   2. Éditez .env.local avec vos valeurs Supabase');
    console.log('   3. Relancez ce script: npx ts-node scripts/check-env.ts\n');
    
    process.exit(1);
  }
}

checkEnv();
