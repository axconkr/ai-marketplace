import { NextRequest, NextResponse } from 'next/server'

/**
 * Health Check Endpoint
 * Used by CI/CD pipeline for post-deployment verification
 *
 * GET /api/health
 * Returns: 200 OK with system status
 */
export async function GET(request: NextRequest) {
  try {
    // Basic health check
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown',
      uptime: process.uptime(),
    }

    // Optional: Add database connection check
    // const dbHealthy = await checkDatabaseConnection()

    // Optional: Add external service checks
    // const servicesHealthy = await checkExternalServices()

    return NextResponse.json(health, { status: 200 })
  } catch (error) {
    console.error('Health check failed:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    )
  }
}

/**
 * Example: Database connection check
 * Uncomment and implement when Prisma is setup
 */
/*
async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()
    return true
  } catch (error) {
    console.error('Database check failed:', error)
    return false
  }
}
*/

/**
 * Example: External services health check
 */
/*
async function checkExternalServices(): Promise<boolean> {
  try {
    // Check Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (supabaseUrl) {
      const response = await fetch(`${supabaseUrl}/rest/v1/`, {
        method: 'HEAD',
      })
      if (!response.ok) return false
    }

    // Add more service checks as needed
    return true
  } catch (error) {
    console.error('External services check failed:', error)
    return false
  }
}
*/
