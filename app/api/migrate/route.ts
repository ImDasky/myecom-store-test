import { NextRequest, NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  // Simple auth check - you can enhance this
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.MIGRATE_SECRET || 'migrate-secret'}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cmd = 'mkdir -p /tmp/.npm && HOME=/tmp npm_config_cache=/tmp/.npm npm_config_userconfig=/tmp/.npmrc npx prisma migrate deploy'
    const { stdout, stderr } = await execAsync(cmd)
    return NextResponse.json({
      success: true,
      output: stdout,
      errors: stderr,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        output: error.stdout,
        errors: error.stderr,
      },
      { status: 500 }
    )
  }
}

