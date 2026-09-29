const mongoose = require('mongoose');

const ExpeditionSchema = new mongoose.Schema({
  expedition_id: { type: String, unique: true, required: true },
  name: { type: String },
  season: { type: String },
  start_date: { type: Date },
  end_date: { type: Date },
  milestones: { type: mongoose.Schema.Types.Mixed },
  budget: { type: mongoose.Schema.Types.Mixed },
  charter_schedule: { type: mongoose.Schema.Types.Mixed },
  budget_allocation: { type: mongoose.Schema.Types.Mixed },
  summer_roster: { type: mongoose.Schema.Types.Mixed },
  winter_roster: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, default: 'Planning' }
});

module.exports = mongoose.model('Expedition', ExpeditionSchema);