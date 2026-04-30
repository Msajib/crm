const { PrismaClient } = require('@prisma/auth-client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@acme.com';
  console.log(`Updating user ${email} to ADMIN role...`);
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN' }
    });
    console.log('Success:', user);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
