require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const crypto = require('crypto');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runTests() {
  console.log('\n--- F.R.O.S.T. ICE-NET End-to-End Integration Audit ---\n');
  const matrix = {
    cors_config: 'FAIL',
    api_health_endpoint: 'FAIL',
    db_connection: 'FAIL',
    users_seeded: 'FAIL',
    requisition_created: 'FAIL',
    requisition_queried: 'FAIL',
    requisition_approved: 'FAIL',
  };

  try {
    // 0. Test API Health & CORS
    try {
      const response = await fetch('http://localhost:5000/api/health', {
        headers: { 'Origin': 'http://localhost:5173' }
      });
      if (response.ok) {
        matrix.api_health_endpoint = 'PASS';
        const corsHeader = response.headers.get('access-control-allow-origin');
        if (corsHeader === 'http://localhost:5173' || corsHeader === '*') {
          matrix.cors_config = 'PASS';
        }
        console.log(`[PASS] API /health endpoint reachable. CORS: ${corsHeader}`);
      }
    } catch (e) {
      console.log(`[WARN] API /health request failed: ${e.message}`);
    }

    // 1. Check DB Connection
    await prisma.$queryRaw`SELECT 1`;
    matrix.db_connection = 'PASS';
    console.log('[PASS] Connected to PostgreSQL via Prisma 7.');

    // 2. Query for seeded users
    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    const commander = await prisma.user.findUnique({ where: { username: 'commander' } });

    if (admin && commander) {
      matrix.users_seeded = 'PASS';
      console.log(`[PASS] Users Found: ${admin.name} (Admin), ${commander.name} (Commander)`);
    } else {
      throw new Error('Required seeded users not found.');
    }

    // 3. Create CRITICAL Requisition as Commander
    const reqPayload = {
      requisition_id: `REQ-${crypto.randomUUID()}`,
      station: commander.station || 'maitri',
      item: 'IoT Base Station',
      quantity: 1,
      unit: 'Units',
      urgency: 'CRITICAL',
      status: 'PENDING_APPROVAL',
      created_at: new Date(),
      updated_at: new Date(),
    };

    const newReq = await prisma.requisition.create({ data: reqPayload });
    if (newReq && newReq.item === 'IoT Base Station') {
      matrix.requisition_created = 'PASS';
      console.log(`[PASS] Commander successfully submitted CRITICAL requisition: ${newReq.requisition_id}`);
    } else {
      throw new Error('Failed to create requisition.');
    }

    // 4. Query Pending Requisition Queue as Admin
    const pendingReqs = await prisma.requisition.findMany({
      where: { status: 'PENDING_APPROVAL' },
    });

    const foundReq = pendingReqs.find((r) => r.requisition_id === newReq.requisition_id);
    if (foundReq) {
      matrix.requisition_queried = 'PASS';
      console.log(`[PASS] Admin successfully queried pending queue and found ${foundReq.requisition_id}`);
    } else {
      throw new Error('Admin could not find the pending requisition.');
    }

    // 5. Update to APPROVED as Admin
    const approvedReq = await prisma.requisition.update({
      where: { requisition_id: foundReq.requisition_id },
      data: {
        status: 'APPROVED',
        decided_by: admin.username,
        updated_at: new Date(),
      },
    });

    if (approvedReq.status === 'APPROVED') {
      matrix.requisition_approved = 'PASS';
      console.log(`[PASS] Admin APPROVED requisition ${approvedReq.requisition_id}`);
    } else {
      throw new Error('Failed to approve requisition.');
    }

  } catch (error) {
    console.error(`\n[ERROR] Test suite aborted: ${error.message}`);
  } finally {
    await prisma.$disconnect();

    // 6. Diagnostics Matrix Output
    console.log('\n--- DIAGNOSTIC MATRIX ---');
    console.table(matrix);
  }
}

runTests();
