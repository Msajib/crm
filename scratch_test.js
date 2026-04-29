const { PrismaClient } = require('@prisma/auth-client');
async function run() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst();
  console.log("Before:", user.avatar ? user.avatar.substring(0, 20) : null);
  
  await prisma.user.update({
    where: { id: user.id },
    data: { avatar: 'test_avatar_123' }
  });
  
  const userAfter = await prisma.user.findFirst();
  console.log("After:", userAfter.avatar);
  await prisma.$disconnect();
}
run();
