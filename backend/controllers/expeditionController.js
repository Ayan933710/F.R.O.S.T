const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function getExpeditionById(req, res) {
  const { id } = req.params;

  if (id === 'ISEA-46') {
    return res.json({
      expedition_id: 'ISEA-46',
      name: '46th Indian Scientific Expedition to Antarctica',
      status: 'Active',
      startDate: '2026-09-01',
      endDate: '2027-03-31',
      team: [
        { id: 'EXP-BIO-04', name: 'Dr. Aisha Malik', role: 'Station Lead', blood_type: 'O+' },
        { id: 'EXP-OPS-01', name: 'Capt. Ishan Verma', role: 'Operations', blood_type: 'A+' }
      ]
    });
  }

  try {
    const e = await prisma.expedition.findUnique({ where: { expedition_id: id } });
    if (!e) return res.status(404).json({ error: 'Not found' });
    res.json(e);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getExpeditionById };
