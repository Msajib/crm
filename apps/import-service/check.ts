import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.importJob.findMany({
    orderBy: { createdAt: 'desc' },
    take: 1,
  });
  console.log(JSON.stringify(jobs[0], null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
