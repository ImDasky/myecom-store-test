import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use NETLIFY_DATABASE_URL if DATABASE_URL is not set (for Netlify Neon integration)
// This ensures Prisma can find the database URL at runtime
if (!process.env.DATABASE_URL && process.env.NETLIFY_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.NETLIFY_DATABASE_URL
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

