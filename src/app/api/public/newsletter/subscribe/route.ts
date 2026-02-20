import { NextRequest, NextResponse } from 'next/server';
import { SubscribeNewsletterUseCase } from '@/core/use-cases/public/SubscribeNewsletter.usecase';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { handleError } from '@/presentation/middlewares/error.middleware';
import { validateRequest } from '@/presentation/middlewares/validation.middleware';
import { newsletterSchema } from '@/presentation/validators/public.validator';

const subscribeNewsletterUseCase = new SubscribeNewsletterUseCase();

/**
 * @swagger
 * /api/public/newsletter/subscribe:
 *   post:
 *     summary: S'abonner à la newsletter avec email
 *     tags: [Public]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Abonnement réussi
 *       400:
 *         description: Email déjà abonné ou données invalides
 *       500:
 *         description: Erreur serveur
 */
export async function POST(request: NextRequest) {
  try {
    const validated = await validateRequest(request, newsletterSchema);

    await subscribeNewsletterUseCase.execute(validated);

    return NextResponse.json(
      ApiResponse.success(null, 'Abonnement à la newsletter réussi'),
      { status: 200 }
    );
  } catch (error) {
    return handleError(error);
  }
}
