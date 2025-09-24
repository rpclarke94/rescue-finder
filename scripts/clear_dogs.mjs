import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.dog.deleteMany({});
    console.log('✅ Deleted all dogs');
  } catch (e) {
    console.error('❌ Error deleting dogs:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
