import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Simple auth check - you can enhance this
  // For easier access, also allow a query parameter
  const authHeader = request.headers.get('authorization')
  const { searchParams } = new URL(request.url)
  const secretParam = searchParams.get('secret')
  const migrateSecret = process.env.MIGRATE_SECRET || 'migrate-secret'
  
  if (authHeader !== `Bearer ${migrateSecret}` && secretParam !== migrateSecret) {
    return NextResponse.json({ 
      error: 'Unauthorized',
      hint: 'Add ?secret=YOUR_MIGRATE_SECRET to the URL or use Authorization header'
    }, { status: 401 })
  }

  try {
    // Ensure DATABASE_URL is set from NETLIFY_DATABASE_URL if needed
    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
    if (databaseUrl && !process.env.DATABASE_URL) {
      process.env.DATABASE_URL = databaseUrl
    }

    if (!process.env.DATABASE_URL && !process.env.NETLIFY_DATABASE_URL) {
      return NextResponse.json({
        success: false,
        error: 'No database URL found. Neither DATABASE_URL nor NETLIFY_DATABASE_URL is set.',
        hint: 'Make sure Neon is connected via Netlify integration or DATABASE_URL is set in environment variables'
      }, { status: 500 })
    }

    // Use npx to ensure we get the right prisma binary
    const cmd = 'npx prisma migrate deploy'
    const { stdout, stderr } = await execAsync(cmd, {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl || process.env.DATABASE_URL
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Migrations completed successfully',
      output: stdout,
      errors: stderr || null,
      databaseUrl: databaseUrl ? `${databaseUrl.substring(0, 20)}...` : 'not shown'
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        output: error.stdout || null,
        errors: error.stderr || null,
        hint: 'Check that DATABASE_URL or NETLIFY_DATABASE_URL is set correctly'
      },
      { status: 500 }
    )
  }
}

