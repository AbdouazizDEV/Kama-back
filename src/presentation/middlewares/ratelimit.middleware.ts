import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/shared/utils/ApiResponse';

// Simple rate limiter en mémoire (pour production, utiliser Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requêtes par minute

export function rateLimitMiddleware(request: NextRequest): NextResponse | null {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();

  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return null;
  }

  if (record.count >= MAX_REQUESTS) {
    return NextResponse.json(
      ApiResponse.error({
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Trop de requêtes. Veuillez réessayer plus tard.',
      }),
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((record.resetTime - now) / 1000)),
        },
      }
    );
  }

  record.count++;
  return null;
}
