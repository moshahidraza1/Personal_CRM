// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient({
//     log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
// });

// export default prisma; 

import 'dotenv/config';
import pkg from '@prisma/client';
import { PrismaPg } from "@prisma/adapter-pg";

const { PrismaClient } = pkg;

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;