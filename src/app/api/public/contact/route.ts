import { NextRequest, NextResponse } from 'next/server';
import { SendContactMessageUseCase } from '@/core/use-cases/public/SendContactMessage.usecase';
import { SupabaseEmailService } from '@/infrastructure/email/SupabaseEmailService';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { contactSchema } from '@/presentation/validators/public.validator';

const emailService = new SupabaseEmailService();
const sendContactMessageUseCase = new SendContactMessageUseCase(emailService);

/**
 * @swagger
 * /api/public/contact:
 *   post:
 *     summary: Envoyer un message au support (sans compte)
 *     tags: [Public]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - email
 *               - sujet
 *               - message
 *             properties:
 *               nom:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               email:
 *                 type: string
 *                 format: email
 *               sujet:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 200
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 2000
 *               telephone:
 *                 type: string
 *                 pattern: '^\+?[0-9]{8,15}$'
 *     responses:
 *       200:
 *         description: Message envoyé avec succès
 *       400:
 *         description: Données invalides
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: NextRequest) {
  try {
    const validated = await validateRequest(request, contactSchema);

    await sendContactMessageUseCase.execute(validated);

    return NextResponse.json(
      ApiResponse.success(null, 'Message envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
