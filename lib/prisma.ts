// lib/prisma.ts

import { PrismaClient } from '@prisma/client'

declare global {
  var prisma: PrismaClient | undefined
}

// Initialize Prisma Client with connection pooling and retry logic
const prisma = global.prisma || new PrismaClient({
  log: ['query', 'error', 'warn'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Add connection error handling
prisma.$use(async (params, next) => {
  const maxRetries = 3
  let retries = 0

  while (retries < maxRetries) {
    try {
      return await next(params)
    } catch (error: any) {
      if (error.code === 'P1001' || error.code === 'P1017') {
        // Database server is unreachable or connection was closed
        retries++
        if (retries === maxRetries) {
          console.error('Max retries reached for database connection')
          throw error
        }
        console.warn(`Database connection error, retrying (${retries}/${maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * retries))
      } else {
        throw error
      }
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma
}

export { prisma }
