require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed...');

  // Upsert Admin in Goa
  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'HQ Admin',
      role: 'admin',
      station: 'Goa HQ',
    },
  });
  console.log('Upserted User: admin');

  // Upsert Commander at the Edge
  await prisma.user.upsert({
    where: { username: 'commander' },
    update: {},
    create: {
      username: 'commander',
      name: 'Edge Commander',
      role: 'commander',
      station: 'Maitri',
    },
  });
  console.log('Upserted User: commander');

  // Upsert Item: Aviation Fuel
  await prisma.item.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      item_id: 'ITEM-001',
      name: 'Aviation Fuel',
      category: 'FUEL',
      quantity: 15000,
      unit: 'Liters',
      station: 'Maitri',
      critical_threshold: 2000,
    },
  });
  console.log('Upserted Item: Aviation Fuel');

  // Upsert Item: Solar Panels
  await prisma.item.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      item_id: 'ITEM-002',
      name: 'Solar Panels',
      category: 'TECHNICAL SPARES',
      quantity: 45,
      unit: 'Units',
      station: 'Maitri',
      critical_threshold: 5,
    },
  });
  console.log('Upserted Item: Solar Panels');

  // Upsert Item: Thermal Rations
  await prisma.item.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      item_id: 'ITEM-003',
      name: 'Thermal Rations',
      category: 'PERISHABLES',
      quantity: 800,
      unit: 'Packs',
      station: 'Maitri',
      critical_threshold: 200,
    },
  });
  console.log('Upserted Item: Thermal Rations');

  // Upsert Item: Medical Kits
  await prisma.item.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      item_id: 'ITEM-004',
      name: 'Medical Kits',
      category: 'MEDICAL',
      quantity: 60,
      unit: 'Units',
      station: 'Maitri',
      critical_threshold: 10,
    },
  });
  console.log('Upserted Item: Medical Kits');

  console.log('Seed completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
