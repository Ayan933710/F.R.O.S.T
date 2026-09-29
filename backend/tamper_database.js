require('dotenv/config');
const mongoose = require('mongoose');
const Manifest = require('./models/Manifest');

async function simulateTampering() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;
    await mongoose.connect(mongoUri);
    console.log('Connected to database...');

    // Find the latest sealed manifest
    const latest = await Manifest.findOne({ crypto_hash: { $ne: null } }).sort({ sealed_at: -1 });
    
    if (!latest) {
      console.log('❌ No sealed manifests found! Please go to the Admin Dashboard and seal one first.');
      process.exit(1);
    }

    // Corrupt the hash to simulate a man-in-the-middle database hack
    const originalHash = latest.crypto_hash;
    const tamperedHash = originalHash.substring(0, 60) + '9999'; // Change the last 4 characters

    latest.crypto_hash = tamperedHash;
    
    // Simulate someone tampering with the digital cargo quantities in the database
    if (latest.items && latest.items.length > 0) {
      latest.items[0].qty -= 1; // Steal an item
    }

    await latest.save();

    console.log('====================================================');
    console.log('🚨 DATABASE TAMPERING SUCCESSFUL (SIMULATION) 🚨');
    console.log('====================================================');
    console.log('Original Hash (On Physical Box)  :', originalHash);
    console.log('New Tampered Hash (In Database)  :', tamperedHash);
    console.log('\\n👉 TEST INSTRUCTIONS:');
    console.log('1. Go to the Commander Cargo Scanner Dashboard.');
    console.log('2. PASTE your original hash into the "Enter scanned payload" box.');
    console.log('3. Click VERIFY.');
    console.log('4. Watch the system catch the database discrepancy!');
    process.exit(0);

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

simulateTampering();
