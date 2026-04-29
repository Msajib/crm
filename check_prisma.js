const { PrismaClient } = require('./node_modules/@prisma/ai-client');
const prisma = new PrismaClient();
console.log('Prisma AI Properties:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));
process.exit(0);
