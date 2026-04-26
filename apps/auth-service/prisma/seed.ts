import { PrismaClient } from '@prisma/auth-client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Super Admin and Tenant Admin...');

  const passwordHash = await bcrypt.hash('password123', 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'super@crm.local' },
    update: {},
    create: {
      email: 'super@crm.local',
      passwordHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      tenantId: 'system',
      isActive: true,
      isVerified: true,
    },
  });

  const tenantAdmin = await prisma.user.upsert({
    where: { email: 'admin@acme.com' },
    update: {},
    create: {
      email: 'admin@acme.com',
      passwordHash,
      firstName: 'Tenant',
      lastName: 'Admin',
      role: 'ADMIN',
      tenantId: 'acme-corp-1',
      isActive: true,
      isVerified: true,
    },
  });

  console.log('Seeding complete!');
  console.log({ superAdmin: superAdmin.email, tenantAdmin: tenantAdmin.email });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
