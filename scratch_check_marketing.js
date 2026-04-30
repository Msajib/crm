const { PrismaClient } = require('@prisma/marketing-client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://postgres:sajib72542@localhost:5432/crm_system?schema=marketing"
    }
  }
});

async function check() {
  try {
    console.log('Connecting to marketing DB...');
    await prisma.$connect();
    console.log('Connected!');
    const count = await prisma.campaign.count();
    console.log('Campaign count:', count);
  } catch (err) {
    console.error('Check failed:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
