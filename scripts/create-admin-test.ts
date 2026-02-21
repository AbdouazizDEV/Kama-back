import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminTest() {
  console.log('🔄 Création d\'un utilisateur ADMIN de test...\n');

  const email = 'admin.test@kama.ga';
  const password = 'AdminTest123!';
  const nom = 'Admin';
  const prenom = 'Test';

  try {
    // Supprimer l'utilisateur existant s'il existe
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers.users.find((u) => u.email === email);

    if (existingUser) {
      console.log('⚠️  Suppression de l\'utilisateur existant...');
      await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
      await prisma.user.deleteMany({
        where: { email },
      });
    }

    // Créer l'utilisateur dans Supabase Auth
    console.log('📝 Création dans Supabase Auth...');
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authUser.user) {
      throw new Error(`Erreur lors de la création dans Auth: ${authError?.message}`);
    }

    console.log(`✅ Utilisateur créé dans Auth: ${authUser.user.id}`);

    // Créer l'utilisateur dans la table users
    console.log('📝 Création dans la table users...');
    const user = await prisma.user.create({
      data: {
        id: authUser.user.id,
        email,
        password: 'hashed_password_placeholder', // Le mot de passe réel est dans Auth
        nom,
        prenom,
        telephone: '+24101234567',
        typeUtilisateur: 'ADMIN',
        estActif: true,
        estVerifie: true,
      },
    });

    console.log(`✅ Utilisateur créé dans la table users: ${user.id}`);

    console.log('\n🎉 Utilisateur ADMIN créé avec succès !\n');
    console.log('📋 Informations de connexion:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   User ID: ${user.id}`);
    console.log(`   Type: ${user.typeUtilisateur}`);
    console.log('\n💡 Vous pouvez maintenant vous connecter pour obtenir un token.');
  } catch (error) {
    console.error('❌ Erreur:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

createAdminTest()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
