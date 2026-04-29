const { PrismaClient } = require('@prisma/crm-client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding CRM Core data...');
  const tenantId = 'system';

  // 1. Create Default Pipeline
  const pipeline = await prisma.pipeline.upsert({
    where: { id: 'default-sales-pipeline' },
    update: {},
    create: {
      id: 'default-sales-pipeline',
      tenantId,
      name: 'Sales Pipeline',
      isDefault: true,
      stages: {
        create: [
          { name: 'Lead', order: 1, color: '#6366f1' },
          { name: 'Qualified', order: 2, color: '#10b981' },
          { name: 'Proposal', order: 3, color: '#f59e0b' },
          { name: 'Negotiation', order: 4, color: '#ec4899' },
          { name: 'Closed Won', order: 5, color: '#059669' },
          { name: 'Closed Lost', order: 6, color: '#dc2626' },
        ]
      }
    }
  });

  // 2. Create a test Company
  const company = await prisma.company.create({
    data: {
      tenantId,
      name: 'Acme Corp',
      industry: 'Technology',
      website: 'https://acme.com'
    }
  });

  // 3. Create a test Contact
  await prisma.contact.create({
    data: {
      tenantId,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@acme.com',
      status: 'LEAD',
      source: 'Website',
      companyId: company.id
    }
  });

  console.log('CRM Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
