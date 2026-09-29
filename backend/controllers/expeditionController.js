const Expedition = require('../models/Expedition');

async function getExpeditionById(req, res) {
  const { id } = req.params;

  try {
    let e = await Expedition.findOne({ expedition_id: id });
    if (!e) {
      if (id === 'ISEA-46') {
        // Fallback for first load if DB is empty
        return res.json({
          expedition_id: 'ISEA-46',
          name: '46th Indian Scientific Expedition to Antarctica',
          status: 'Active',
          startDate: '2026-09-01',
          endDate: '2027-03-31',
          team: []
        });
      }
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(e);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { getExpeditionById };
