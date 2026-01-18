import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is not defined');
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const superPassword = await bcrypt.hash('Super123!', 10);

  await prisma.user.upsert({
    where: { email: 'admin@eqapk.com' },
    update: {
      name: 'Admin',
      role: UserRole.ADMIN,
      password: adminPassword,
    },
    create: {
      email: 'admin@eqapk.com',
      name: 'Admin',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });

  await prisma.user.upsert({
    where: { email: 'superadmin@eqapk.com' },
    update: {
      name: 'Superadmin',
      role: UserRole.SUPERADMIN,
      password: superPassword,
    },
    create: {
      email: 'superadmin@eqapk.com',
      name: 'Superadmin',
      password: superPassword,
      role: UserRole.SUPERADMIN,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
