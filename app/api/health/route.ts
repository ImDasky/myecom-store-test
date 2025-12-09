import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { ensureMigrations } from '@/lib/migrate'

export async function GET() {
  try {
    // Check if DATABASE_URL or NETLIFY_DATABASE_URL is set
    // NETLIFY_DATABASE_URL is automatically provided when Neon is connected via Netlify
    const hasDbUrl = !!(process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL)
    
    if (!hasDbUrl) {
      return NextResponse.json({
        status: 'error',
        message: 'Database URL not found. Neither DATABASE_URL nor NETLIFY_DATABASE_URL is set.',
        database: 'not configured',
        hint: 'If using Neon, make sure it is connected via Netlify integration'
      }, { status: 500 })
    }

    // Try to connect to database and run migrations if needed
    try {
      // Ensure migrations are run automatically
      await ensureMigrations()
      
      const prisma = await getPrisma()
      await prisma.$connect()
      const settings = await prisma.storeSettings.findFirst()
      
      return NextResponse.json({
        status: 'ok',
        database: 'connected',
        hasSettings: !!settings,
        timestamp: new Date().toISOString()
      })
    } catch (dbError: any) {
      // If it's a "table does not exist" error, try running migrations
      if (dbError.message?.includes('does not exist') || dbError.message?.includes('relation') || dbError.message?.includes('table')) {
        try {
          console.log('Tables missing, attempting automatic migration...')
          await ensureMigrations()
          const prisma = await getPrisma()
          const settings = await prisma.storeSettings.findFirst()
          return NextResponse.json({
            status: 'ok',
            database: 'connected',
            hasSettings: !!settings,
            migrations: 'auto-run',
            timestamp: new Date().toISOString()
          })
        } catch (retryError: any) {
          return NextResponse.json({
            status: 'error',
            message: 'Database connection failed after migration attempt',
            error: retryError.message,
            database: 'connection failed'
          }, { status: 500 })
        }
      }
      
      return NextResponse.json({
        status: 'error',
        message: 'Database connection failed',
        error: dbError.message,
        database: 'connection failed'
      }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

