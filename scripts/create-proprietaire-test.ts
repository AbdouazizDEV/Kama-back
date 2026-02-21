import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function createProprietaire() {
  const email = 'proprietaire.test@gmail.com';
  const password = 'Proprietaire123!';

  // Supprimer l'utilisateur s'il existe déjà
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  const existingUser = existingUsers?.users.find((u) => u.email === email);
  
  if (existingUser) {
    console.log('🗑️  Suppression de l\'utilisateur existant dans Auth...');
    await supabase.auth.admin.deleteUser(existingUser.id);
  }

  // Supprimer de la table users aussi
  const { data: existingDbUser } = await supabaseAdmin
    .from('users')
    .select('id')
    .eq('email', email)
    .single();

  if (existingDbUser) {
    console.log('🗑️  Suppression de l\'utilisateur existant dans users...');
    await supabaseAdmin.from('users').delete().eq('id', existingDbUser.id);
  }

  // Créer l'utilisateur avec email confirmé
  console.log('👤 Création du propriétaire de test...');
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nom: 'Proprietaire',
      prenom: 'Test',
      telephone: '+241061234567',
      type_utilisateur: 'PROPRIETAIRE',
    },
  });

  if (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }

  console.log('✅ Propriétaire créé dans Supabase Auth');

  // Créer l'utilisateur dans la table users
  console.log('💾 Création dans la table users...');
  const { error: dbError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: data.user.id,
      email: email,
      nom: 'Proprietaire',
      prenom: 'Test',
      telephone: '+241061234567',
      type_utilisateur: 'PROPRIETAIRE',
      est_actif: true,
      est_verifie: true,
      password: '$2a$10$placeholder', // Placeholder, Supabase Auth gère le password
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'id',
    });

  if (dbError) {
    console.error('⚠️  Erreur lors de la création dans users:', dbError);
  } else {
    console.log('✅ Utilisateur créé dans la table users');
  }

  console.log('');
  console.log('✅ Propriétaire créé avec succès!');
  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
  console.log('🆔 User ID:', data.user.id);
}

createProprietaire()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Erreur:', error);
    process.exit(1);
  });
