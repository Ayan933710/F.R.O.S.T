const mongoose = require('mongoose');
require('dotenv/config');

const Manifest = require('./models/Manifest');

mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL).then(async () => {
  const manifests = await Manifest.find();
  for (let m of manifests) {
    let changed = false;
    if (m.vessel === 'IAF IL-76 Gajraj') {
      m.vessel = 'INS Jalashwa';
      changed = true;
    }
    
    if (m.sealed_payload_json) {
      let payload = m.sealed_payload_json;
      if (payload.includes('IAF IL-76 Gajraj')) {
        payload = payload.replace(/IAF IL-76 Gajraj/g, 'INS Jalashwa');
        m.sealed_payload_json = payload;
        changed = true;
      }
    }

    if (changed) {
      await m.save();
    }
  }
  console.log('Successfully updated IAF vessel names to INS Navy Ships in the database.');
  process.exit(0);
});
