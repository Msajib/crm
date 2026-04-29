const { PrismaClient } = require('./node_modules/@prisma/crm-client');
const prisma = new PrismaClient();
console.log('Prisma CRM Properties:', Object.keys(prisma).filter(k => !k.startsWith('$') && !k.startsWith('_')));
process.exit(0);
