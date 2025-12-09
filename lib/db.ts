import { PrismaClient } from '@prisma/client'
import { ensureMigrations } from './migrate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use NETLIFY_DATABASE_URL if DATABASE_URL is not set (for Netlify Neon integration)
// When Neon is connected via Netlify integration, NETLIFY_DATABASE_URL is automatically
// provided at runtime. We need to set DATABASE_URL before PrismaClient is instantiated
// because Prisma reads DATABASE_URL from process.env during initialization.
const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL

if (databaseUrl && !process.env.DATABASE_URL) {
  // Set DATABASE_URL so Prisma can use it
  process.env.DATABASE_URL = databaseUrl
}

// Initialize Prisma Client
// This will use DATABASE_URL from process.env (which we just set above if needed)
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

/**
 * Get Prisma client and ensure migrations are run
 * This automatically runs migrations on first database access if tables don't exist
 */
export async function getPrisma() {
  // Run migrations automatically if needed (only runs once)
  await ensureMigrations()
  return prisma
}

