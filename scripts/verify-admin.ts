import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if admin role exists
    const adminRole = await prisma.role.findUnique({
      where: { key: 'admin' },
      include: {
        rolePermissions: true
      }
    });
    console.log('Admin role:', adminRole ? 'Found' : 'Not found');
    if (adminRole) {
      console.log('Role permissions:', adminRole.rolePermissions);
    }

    // Check if admin user exists
    const adminUser = await prisma.user.findUnique({
      where: { username: 'admin' },
      include: {
        role: {
          include: {
            rolePermissions: true
          }
        }
      }
    });
    console.log('Admin user:', adminUser ? 'Found' : 'Not found');
    if (adminUser) {
      console.log('User details:', {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role.key,
        permissions: adminUser.role.rolePermissions.map(p => p.key)
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 