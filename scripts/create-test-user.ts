import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create admin role if it doesn't exist
  const adminRole = await prisma.role.upsert({
    where: { key: 'admin' },
    update: {},
    create: {
      key: 'admin',
    },
  });

  // Create test user
  const hashedPassword = await bcrypt.hash('Test123!', 10);
  const testUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: adminRole.id,
      active: true,
    },
  });

  console.log('Test user created successfully!');
  console.log('Username: admin');
  console.log('Password: Test123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 