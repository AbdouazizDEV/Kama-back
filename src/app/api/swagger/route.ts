import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/config/swagger.config';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(swaggerSpec);
}
