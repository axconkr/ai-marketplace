import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  services: {
    database: 'up' | 'down';
    api: 'up' | 'down';
  };
  latency?: {
    database: number;
  };
}

const startTime = Date.now();

export async function GET() {
  const health: HealthStatus = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'unknown',
    uptime: Math.floor((Date.now() - startTime) / 1000),
    services: {
      database: 'down',
      api: 'up',
    },
  };

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatency = Date.now() - dbStart;

    health.services.database = 'up';
    health.latency = { database: dbLatency };

    if (dbLatency > 1000) {
      health.status = 'degraded';
    }
  } catch {
    health.services.database = 'down';
    health.status = 'unhealthy';
  }

  const httpStatus = health.status === 'unhealthy' ? 503 : 200;

  return NextResponse.json(health, {
    status: httpStatus,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
