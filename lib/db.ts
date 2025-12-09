import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Use NETLIFY_DATABASE_URL if DATABASE_URL is not set (for Netlify Neon integration)
const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL

// Only pass datasource config if we have a URL (for runtime)
// During build, Prisma doesn't need a real connection
const prismaConfig = databaseUrl ? {
  datasources: {
    db: {
      url: databaseUrl,
    },
  },
} : {}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaConfig)

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

