import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// eslint-disable-next-line import/prefer-default-export, operator-linebreak
export const prisma =
  // eslint-disable-next-line operator-linebreak
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
