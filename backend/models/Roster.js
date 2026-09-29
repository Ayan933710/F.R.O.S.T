const mongoose = require('mongoose');

const RosterSchema = new mongoose.Schema({
  personnel_id: { type: String, unique: true, required: true },
  name: { type: String },
  role: { type: String },
  specialization: { type: String },
  team: { type: String },
  expedition_id: { type: String },
  blood_type: { type: String },
  allergies: { type: String },
  station: { type: String }
});

module.exports = mongoose.model('Roster', RosterSchema);