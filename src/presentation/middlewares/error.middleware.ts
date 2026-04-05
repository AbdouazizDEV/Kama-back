import { NextResponse } from 'next/server';
import { ApiError } from '@/shared/utils/ApiError';
import { ApiResponse } from '@/shared/utils/ApiResponse';
import { logger } from '@/shared/utils/logger';

export function handleError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    const payload = {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
    };
    // 4xx : réponses métier attendues — pas de niveau error ni de stack systématique
    if (error.statusCode < 500) {
      logger.warn('API client', payload);
    } else {
      logger.error('API serveur', { ...payload, stack: error.stack });
    }

    return NextResponse.json(
      ApiResponse.error({
        code: error.code,
        message: error.message,
        details: error.details,
      }),
      { status: error.statusCode }
    );
  }

  const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
  const errorStack = error instanceof Error ? error.stack : undefined;

  logger.error('Erreur API non gérée', {
    message: errorMessage,
    stack: errorStack,
    error,
  });

  return NextResponse.json(
    ApiResponse.error({
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'development' 
        ? `Erreur serveur interne: ${errorMessage}`
        : 'Erreur serveur interne',
      details: process.env.NODE_ENV === 'development' ? { stack: errorStack } : undefined,
    }),
    { status: 500 }
  );
}
