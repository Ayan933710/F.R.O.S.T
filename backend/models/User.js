const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password_hash: { type: String },
  name: { type: String },
  role: { type: String, default: 'commander' },
  station: { type: String },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);