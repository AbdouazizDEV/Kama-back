import { NextRequest } from 'next/server';
import { ZodSchema } from 'zod';
import { ApiError } from '@/shared/utils/ApiError';

/**
 * Valide le body JSON d'une requête (POST, PUT, PATCH)
 */
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

/**
 * Valide les query parameters d'une requête (GET)
 */
export function validateQuery<T>(
  query: Record<string, string | null>,
  schema: ZodSchema<T>
): T {
  try {
    // Convertir les valeurs null en undefined pour Zod
    const cleanedQuery: Record<string, string | undefined> = {};
    for (const [key, value] of Object.entries(query)) {
      cleanedQuery[key] = value ?? undefined;
    }
    const validated = schema.parse(cleanedQuery);
    return validated;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      throw ApiError.badRequest('Erreur de validation', error.errors);
    }
    throw ApiError.badRequest('Données invalides');
  }
}
