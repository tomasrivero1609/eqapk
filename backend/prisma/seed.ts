import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcryptjs';
import { ALL_PERMISSIONS } from '../src/common/permissions';

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
      role: UserRole.STAFF,
      password: adminPassword,
      permissions: ALL_PERMISSIONS,
    },
    create: {
      email: 'admin@eqapk.com',
      name: 'Admin',
      password: adminPassword,
      role: UserRole.STAFF,
      permissions: ALL_PERMISSIONS,
    },
  });

  await prisma.user.upsert({
    where: { email: 'superadmin@eqapk.com' },
    update: {
      name: 'Superadmin',
      role: UserRole.SUPERADMIN,
      password: superPassword,
      permissions: ALL_PERMISSIONS,
    },
    create: {
      email: 'superadmin@eqapk.com',
      name: 'Superadmin',
      password: superPassword,
      role: UserRole.SUPERADMIN,
      permissions: ALL_PERMISSIONS,
    },
  });

  const tomasPassword = await bcrypt.hash('ten20102010', 10);
  await prisma.user.upsert({
    where: { email: 'tomasrivero1609@gmail.com' },
    update: {
      name: 'Tomás Rivero',
      role: UserRole.SUPERADMIN,
      password: tomasPassword,
      permissions: ALL_PERMISSIONS,
    },
    create: {
      email: 'tomasrivero1609@gmail.com',
      name: 'Tomás Rivero',
      password: tomasPassword,
      role: UserRole.SUPERADMIN,
      permissions: ALL_PERMISSIONS,
    },
  });

  const belenPassword = await bcrypt.hash('belenapk123', 10);
  await prisma.user.upsert({
    where: { email: 'belenalvarez638@gmail.com' },
    update: {
      name: 'Belén Alvarez',
      role: UserRole.SUPERADMIN,
      password: belenPassword,
      permissions: ALL_PERMISSIONS,
    },
    create: {
      email: 'belenalvarez638@gmail.com',
      name: 'Belén Alvarez',
      password: belenPassword,
      role: UserRole.SUPERADMIN,
      permissions: ALL_PERMISSIONS,
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
