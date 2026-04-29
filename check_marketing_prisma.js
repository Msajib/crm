const { PrismaClient } = require('./node_modules/@prisma/marketing-client');
const prisma = new PrismaClient();
console.log('Prisma Marketing Properties:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));
process.exit(0);
