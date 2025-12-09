import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    // Try to connect to database
    try {
      await prisma.$connect()
      const settings = await prisma.storeSettings.findFirst()
      
      return NextResponse.json({
        status: 'ok',
        database: 'connected',
        hasSettings: !!settings,
        timestamp: new Date().toISOString()
      })
    } catch (dbError: any) {
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

