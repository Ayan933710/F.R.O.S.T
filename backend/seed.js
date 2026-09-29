require('dotenv/config');
const mongoose = require('mongoose');
const User = require('./models/User');
const Item = require('./models/Item');

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;
    if (!mongoUri) {
      throw new Error('Database URI (MONGO_URI) is not defined in the environment variables.');
    }

    // 1. Connect to the database
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // 2. Clear collections to ensure a clean slate
    console.log('Clearing existing Users and Items...');
    await User.deleteMany({});
    await Item.deleteMany({});

    // 3. Insert base Users
    console.log('Inserting base Users...');
    await User.insertMany([
      {
        username: 'admin',
        password_hash: null,
        name: 'HQ Operations',
        role: 'Admin',
        station: 'NCPOR Goa'
      },
      {
        username: 'commander_maitri',
        password_hash: null,
        name: 'Dr. Aisha Malik',
        role: 'Commander',
        station: 'Maitri'
      }
    ]);

    // 4. Insert baseline logistics Items
    console.log('Inserting baseline logistics items...');
    await Item.insertMany([
      {
        item_id: 'ITM-MED-001',
        name: 'Cold-Climate Medical Kits',
        category: 'Medical',
        quantity: 25,
        unit: 'Kits',
        station: 'Maitri',
        critical_threshold: 5,
        last_updated: new Date()
      },
      {
        item_id: 'ITM-COM-012',
        name: 'LoRa Mesh Nodes',
        category: 'Comms',
        quantity: 15,
        unit: 'Nodes',
        station: 'Maitri',
        critical_threshold: 3,
        last_updated: new Date()
      },
      {
        item_id: 'ITM-PWR-088',
        name: 'Lithium Iron Phosphate Packs',
        category: 'Power',
        quantity: 150,
        unit: 'Packs',
        station: 'Bharati',
        critical_threshold: 20,
        last_updated: new Date()
      },
      {
        item_id: 'ITM-RAT-500',
        name: 'High-Calorie Polar Rations',
        category: 'Supplies',
        quantity: 800,
        unit: 'Boxes',
        station: 'Himadri',
        critical_threshold: 150,
        last_updated: new Date()
      }
    ]);

    console.log('✅ Database successfully seeded with ICE-NET baseline data!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // 5. Ensure the script exits cleanly
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
}

seedDatabase();
