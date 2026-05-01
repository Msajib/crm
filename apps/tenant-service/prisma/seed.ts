import { PrismaClient } from '@prisma/tenant-client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Tenants and Plans...');

  const plan = await prisma.plan.upsert({
    where: { tier: 'STARTER' },
    update: {},
    create: {
      name: 'Starter Plan',
      tier: 'STARTER',
      price: 0,
      currency: 'USD',
      maxStaff: 5,
      maxContacts: 1000,
      maxCampaigns: 5,
    },
  });

  await prisma.tenant.upsert({
    where: { slug: 'acme' },
    update: {},
    create: {
      id: 'acme-corp-1',
      name: 'Acme Corporation',
      slug: 'acme',
      subdomain: 'acme',
      ownerId: 'admin@acme.com', // Matches seed from auth
      planId: plan.id,
      status: 'ACTIVE',
    },
  });

  await prisma.systemSetting.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      systemName: 'CRM Pro',
      primaryColor: '#6366f1',
      secondaryColor: '#4f46e5',
      accentColor: '#f59e0b',
    },
  });

  console.log('Tenant seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
