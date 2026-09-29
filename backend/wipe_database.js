const mongoose = require('mongoose');
require('dotenv/config');

mongoose.connect(process.env.MONGO_URI || process.env.DATABASE_URL).then(async () => {
  console.log('Connected to MongoDB. Dropping database...');
  
  await mongoose.connection.db.dropDatabase();
  
  console.log('Database successfully dropped! It is 100% wiped.');
  process.exit(0);
}).catch(err => {
  console.error('Error wiping database:', err);
  process.exit(1);
});
