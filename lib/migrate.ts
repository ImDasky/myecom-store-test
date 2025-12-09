import { readFileSync } from 'fs'
import { join } from 'path'
import { prisma } from './db'

let migrationRunning = false
let migrationCompleted = false

/**
 * Automatically run migrations if tables don't exist
 * This executes SQL migrations directly using Prisma Client
 * (works in serverless environments where Prisma CLI isn't available)
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

    console.log('Running automatic database migrations...')
    
    // Check if migrations table exists (Prisma's migration tracking table)
    try {
      await prisma.$executeRawUnsafe(`
        SELECT 1 FROM "_prisma_migrations" LIMIT 1
      `)
      // If we get here, migrations table exists, so migrations might have been run
      // But let's check if StoreSettings table exists
      try {
        await prisma.$executeRawUnsafe(`SELECT 1 FROM "StoreSettings" LIMIT 1`)
        console.log('Database tables already exist. Skipping migrations.')
        migrationCompleted = true
        migrationRunning = false
        return
      } catch {
        // StoreSettings doesn't exist, need to run migrations
      }
    } catch {
      // _prisma_migrations table doesn't exist, need to create it first
      await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
          "id" VARCHAR(36) NOT NULL,
          "checksum" VARCHAR(64) NOT NULL,
          "finished_at" TIMESTAMP,
          "migration_name" VARCHAR(255) NOT NULL,
          "logs" TEXT,
          "rolled_back_at" TIMESTAMP,
          "started_at" TIMESTAMP NOT NULL DEFAULT now(),
          "applied_steps_count" INTEGER NOT NULL DEFAULT 0,
          CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id")
        )
      `)
    }

    // Read and execute migrations in order
    const migrationsDir = join(process.cwd(), 'prisma', 'migrations')
    const migrationFiles = [
      { name: '20251209024935_init', file: '20251209024935_init/migration.sql' },
      { name: '20251208203810_add_categories', file: '20251208203810_add_categories/migration.sql' },
      { name: '20251209120000_add_seo_settings', file: '20251209120000_add_seo_settings/migration.sql' },
      { name: '20251209121000_add_map_embed', file: '20251209121000_add_map_embed/migration.sql' },
    ]

    for (const migration of migrationFiles) {
      try {
        // Check if migration was already applied
        const applied = await prisma.$queryRawUnsafe<Array<{ id: string }>>(`
          SELECT id FROM "_prisma_migrations" WHERE migration_name = '${migration.name.replace(/'/g, "''")}'
        `)
        
        if (applied && applied.length > 0) {
          console.log(`Migration ${migration.name} already applied, skipping...`)
          continue
        }

        // Read migration SQL file
        const migrationPath = join(migrationsDir, migration.file)
        const sql = readFileSync(migrationPath, 'utf-8')
        
        // Execute migration
        console.log(`Applying migration: ${migration.name}`)
        await prisma.$executeRawUnsafe(sql)
        
        // Record migration in _prisma_migrations table
        const migrationNameEscaped = migration.name.replace(/'/g, "''")
        await prisma.$executeRawUnsafe(`
          INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, applied_steps_count, finished_at)
          VALUES (gen_random_uuid()::text, '', '${migrationNameEscaped}', now(), 1, now())
        `)
        
        console.log(`Migration ${migration.name} applied successfully`)
      } catch (error: any) {
        // If table already exists error, that's OK - migration was already run
        if (error.message?.includes('already exists') || error.message?.includes('duplicate') || error.message?.includes('relation') && error.message?.includes('already exists')) {
          console.log(`Migration ${migration.name} appears to already be applied`)
          // Still record it
          try {
            const migrationNameEscaped = migration.name.replace(/'/g, "''")
            await prisma.$executeRawUnsafe(`
              INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, applied_steps_count, finished_at)
              VALUES (gen_random_uuid()::text, '', '${migrationNameEscaped}', now(), 1, now())
              ON CONFLICT DO NOTHING
            `)
          } catch {
            // Ignore
          }
        } else {
          console.warn(`Error applying migration ${migration.name}:`, error.message)
          throw error
        }
      }
    }
    
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
