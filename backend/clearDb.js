require('dotenv/config');
const mongoose = require('mongoose');

// Import all models
const AuditLog = require('./models/AuditLog');
const CrdtSnapshot = require('./models/CrdtSnapshot');
const Expedition = require('./models/Expedition');
const Geofence = require('./models/Geofence');
const InventoryMovement = require('./models/InventoryMovement');
const Item = require('./models/Item');
const Manifest = require('./models/Manifest');
const Requisition = require('./models/Requisition');
const Roster = require('./models/Roster');
const Telemetry = require('./models/Telemetry');
const User = require('./models/User');

async function clearDatabase() {
  const args = process.argv.slice(2);
  const keepAdmin = !args.includes('--purge-all-users');

  try {
    const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      throw new Error('Database URI (MONGO_URI) is not defined in the environment variables.');
    }

    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for database purge.');

    // 1. Delete collections
    const models = {
      AuditLog,
      CrdtSnapshot,
      Expedition,
      Geofence,
      InventoryMovement,
      Item,
      Manifest,
      Requisition,
      Roster,
      Telemetry
    };

    for (const [name, model] of Object.entries(models)) {
      const result = await model.deleteMany({});
      console.log(`Deleted ${result.deletedCount} documents from ${name}.`);
    }

    // 2. Handle Users
    if (keepAdmin) {
      // Retain users with role 'Admin' (or 'admin' depending on your seed data)
      const result = await User.deleteMany({ role: { $nin: ['Admin', 'admin'] } });
      console.log(`Deleted ${result.deletedCount} non-admin documents from User. (Kept Admins)`);
      console.log(`Note: Run with --purge-all-users to delete ALL users.`);
    } else {
      const result = await User.deleteMany({});
      console.log(`Deleted ${result.deletedCount} documents from User (Including Admins).`);
    }

    console.log('✅ Clean-slate purge complete.');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

clearDatabase();
