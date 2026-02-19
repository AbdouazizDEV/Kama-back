import { NextRequest } from 'next/server';
import { ZodSchema } from 'zod';
import { ApiError } from '@/shared/utils/ApiError';

export async function validateRequest<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    const validated = schema.parse(body);
    return validated;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      throw ApiError.badRequest('Erreur de validation', error.errors);
    }
    throw ApiError.badRequest('Données invalides');
  }
}
