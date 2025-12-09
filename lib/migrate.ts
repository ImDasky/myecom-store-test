import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

let migrationRunning = false
let migrationCompleted = false

/**
 * Automatically run migrations if tables don't exist
 * This is called on first database access to ensure tables are created
 */
export async function ensureMigrations(): Promise<void> {
  // Only run once per process
  if (migrationCompleted || migrationRunning) {
    return
  }

  migrationRunning = true

  try {
    // Ensure DATABASE_URL is set from NETLIFY_DATABASE_URL if needed
    const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL
    
    if (!databaseUrl) {
      console.warn('No database URL found. Skipping automatic migrations.')
      migrationRunning = false
      return
    }

    if (databaseUrl && !process.env.DATABASE_URL) {
      process.env.DATABASE_URL = databaseUrl
    }

    // Run migrations
    console.log('Running automatic database migrations...')
    const cmd = 'npx prisma migrate deploy'
    await execAsync(cmd, {
      env: {
        ...process.env,
        DATABASE_URL: databaseUrl
      },
      timeout: 60000 // 60 second timeout
    })
    
    console.log('Automatic migrations completed successfully')
    migrationCompleted = true
  } catch (error: any) {
    // Don't throw - just log. The app can still work if migrations fail
    // (they might have already been run)
    console.warn('Automatic migration failed (this is OK if migrations were already run):', error.message)
  } finally {
    migrationRunning = false
  }
}

