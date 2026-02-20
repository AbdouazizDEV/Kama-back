import { supabase } from '@/infrastructure/database/supabase.client';
import { ApiError } from '@/shared/utils/ApiError';

export interface SubscribeNewsletterInput {
  email: string;
}

export class SubscribeNewsletterUseCase {
  async execute(input: SubscribeNewsletterInput): Promise<void> {
    // Vérifier si l'email existe déjà
    const { data: existing } = await supabase
      .from('newsletter_subscriptions')
      .select('*')
      .eq('email', input.email)
      .single();

    if (existing) {
      throw ApiError.badRequest('Cet email est déjà abonné à la newsletter');
    }

    // Créer l'abonnement
    const { error } = await supabase.from('newsletter_subscriptions').insert([
      {
        email: input.email,
        date_inscription: new Date().toISOString(),
        est_actif: true,
      },
    ]);

    if (error) {
      throw new Error(`Erreur lors de l'abonnement: ${error.message}`);
    }
  }
}
