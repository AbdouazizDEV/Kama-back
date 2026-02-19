import { NextResponse } from 'next/server';
import { supabase } from '@/config/supabase.config';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { logger } from '@/shared/utils/logger';

/**
 * Endpoint de test pour vérifier la connexion à Supabase
 * GET /api/test-db
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Test 1: Connexion basique
    const { data: healthData, error: healthError } = await supabase
      .from('users')
      .select('count')
      .limit(0);

    if (healthError) {
      logger.error('Erreur de connexion Supabase:', healthError);
      return NextResponse.json(
        ApiResponse.error({
          code: 'DATABASE_CONNECTION_ERROR',
          message: 'Erreur de connexion à la base de données',
          details: {
            error: healthError.message,
            hint: healthError.hint,
            code: healthError.code,
          },
        }),
        { status: 500 }
      );
    }

    // Test 2: Vérifier si la table users existe
    const { data: tableData, error: tableError } = await supabase
      .rpc('check_table_exists', { table_name: 'users' })
      .single();

    // Test 3: Compter les utilisateurs (si la table existe)
    let userCount = 0;
    try {
      const { count, error: countError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (!countError) {
        userCount = count || 0;
      }
    } catch (err) {
      // La table n'existe peut-être pas encore
      logger.warn('Table users non trouvée, migrations nécessaires');
    }

    // Test 4: Vérifier les variables d'environnement
    const envCheck = {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabaseServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      databaseUrl: !!process.env.DATABASE_URL,
    };

    const allEnvSet = Object.values(envCheck).every((v) => v === true);

    return NextResponse.json(
      ApiResponse.success({
        status: 'connected',
        timestamp: new Date().toISOString(),
        database: {
          connected: true,
          tableExists: !tableError,
          userCount,
        },
        environment: {
          configured: allEnvSet,
          variables: envCheck,
        },
        message: allEnvSet
          ? 'Connexion à Supabase réussie'
          : 'Connexion réussie mais certaines variables d\'environnement manquent',
      })
    );
  } catch (error) {
    return handleError(error);
  }
}
