import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create basic permissions if they don't exist
    const permissions = [
      'VIEW_DASHBOARD',
      'MANAGE_USERS',
      'MANAGE_ROLES',
      'MANAGE_PERMISSIONS',
      'MANAGE_CUSTOMERS',
      'MANAGE_ORDERS',
      'MANAGE_PRODUCTS',
      'MANAGE_INVENTORY',
      'MANAGE_SETTINGS',
      'VIEW_REPORTS',
      'MANAGE_REPORTS'
    ];

    for (const permKey of permissions) {
      await prisma.permission.upsert({
        where: { key: permKey },
        update: {},
        create: { key: permKey }
      });
    }

    // Get admin role
    const adminRole = await prisma.role.findUnique({
      where: { key: 'admin' }
    });

    if (!adminRole) {
      throw new Error('Admin role not found');
    }

    // Get all permissions
    const allPermissions = await prisma.permission.findMany();

    // Connect all permissions to admin role
    await prisma.role.update({
      where: { id: adminRole.id },
      data: {
        rolePermissions: {
          connect: allPermissions.map(p => ({ id: p.id }))
        }
      }
    });

    console.log('Admin permissions set up successfully!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 