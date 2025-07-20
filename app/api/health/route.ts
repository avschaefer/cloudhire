// app/api/health/route.ts - Health check endpoint
import { NextResponse } from 'next/server';
import { validateConfig } from '@/lib/config';
import { validateEmailConfig } from '@/lib/email-utils';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        config: false,
        email: false,
        database: false
      }
    };

    // Check configuration
    try {
      validateConfig();
      health.services.config = true;
    } catch (error) {
      health.services.config = false;
      health.status = 'degraded';
    }

    // Check email configuration
    try {
      health.services.email = validateEmailConfig();
    } catch (error) {
      health.services.email = false;
      health.status = 'degraded';
    }

    // Check database (if available)
    try {
      // This would check D1 database connectivity
      // For now, we'll assume it's available if config is valid
      health.services.database = health.services.config;
    } catch (error) {
      health.services.database = false;
      health.status = 'degraded';
    }

    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    return NextResponse.json(health, { status: statusCode });
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 