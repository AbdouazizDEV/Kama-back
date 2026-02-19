import { NextResponse } from 'next/server';
import { ApiError } from '@/shared/utils/ApiError';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { logger } from '@/shared/utils/logger';

export function handleError(error: unknown): NextResponse {
  logger.error('Erreur API:', error);

  if (error instanceof ApiError) {
    return NextResponse.json(
      ApiResponse.error({
        code: error.code,
        message: error.message,
        details: error.details,
      }),
      { status: error.statusCode }
    );
  }

  // Erreur inattendue
  return NextResponse.json(
    ApiResponse.error({
      code: 'INTERNAL_ERROR',
      message: 'Erreur serveur interne',
    }),
    { status: 500 }
  );
}
