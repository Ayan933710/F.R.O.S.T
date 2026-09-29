const mongoose = require('mongoose');
require('dotenv/config');

const Manifest = require('./models/Manifest');

mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL).then(async () => {
  const manifests = await Manifest.find();
  for (let m of manifests) {
    let changed = false;
    if (m.vessel === 'LC-130 Hercules') {
      m.vessel = 'IAF IL-76 Gajraj';
      changed = true;
    }
    if (m.vessel === 'Icebreaker SA Agulhas') {
      m.vessel = 'PRV Sagar Nidhi';
      changed = true;
    }
    if (m.vessel === 'Ilyushin IL-76') {
      m.vessel = 'PRV Sagar Kanya';
      changed = true;
    }
    if (m.vessel === 'C-17 Globemaster') {
      m.vessel = 'PRV Sagar Sampada';
      changed = true;
    }

    if (m.sealed_payload_json) {
      let payload = m.sealed_payload_json;
      payload = payload.replace(/LC-130 Hercules/g, 'IAF IL-76 Gajraj');
      payload = payload.replace(/Icebreaker SA Agulhas/g, 'PRV Sagar Nidhi');
      payload = payload.replace(/Ilyushin IL-76/g, 'PRV Sagar Kanya');
      payload = payload.replace(/C-17 Globemaster/g, 'PRV Sagar Sampada');
      m.sealed_payload_json = payload;
      changed = true;
    }

    if (changed) {
      await m.save();
    }
  }
  console.log('Successfully updated vessel names in the database.');
  process.exit(0);
});
