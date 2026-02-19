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

  // Erreur inattendue - logger plus de détails
  const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  logger.error('Erreur détaillée:', {
    message: errorMessage,
    stack: errorStack,
    error: error,
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
