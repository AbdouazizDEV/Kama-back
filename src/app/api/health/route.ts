import { NextResponse } from 'next/server';
import { ApiResponse } from '@/shared/utils/ApiResponse';

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    ApiResponse.success({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  );
}
