// Supabase Edge Function pour envoyer des emails personnalisés
// Déployez cette fonction dans Supabase: supabase functions deploy send-email

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || '';

interface EmailRequest {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

serve(async (req) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    const { to, subject, text, html }: EmailRequest = await req.json();

    if (!to || !subject || !text) {
      return new Response(
        JSON.stringify({ error: 'to, subject, and text are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Option 1: Utiliser Resend (recommandé pour les emails personnalisés)
    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Kama <noreply@kama.com>', // Configurez votre domaine dans Resend
          to,
          subject,
          text,
          html: html || text,
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.json();
        throw new Error(`Resend API error: ${JSON.stringify(error)}`);
      }

      const data = await resendResponse.json();
      return new Response(
        JSON.stringify({ success: true, messageId: data.id }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }

    // Option 2: Fallback - Utiliser le service email de Supabase (limité)
    // Note: Supabase n'a pas d'API directe pour les emails personnalisés
    // Vous devez configurer un SMTP personnalisé dans Supabase Dashboard
    // ou utiliser un service comme Resend, SendGrid, etc.

    return new Response(
      JSON.stringify({
        error: 'RESEND_API_KEY not configured. Please configure Resend or another email service.',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
});
