const mongoose = require('mongoose');

const TelemetrySchema = new mongoose.Schema({
  node_id: { type: String },
  personnel_id: { type: String },
  lat: { type: Number },
  lng: { type: Number },
  battery_pct: { type: Number },
  status: { type: String },
  timestamp: { type: Date }
});

module.exports = mongoose.model('Telemetry', TelemetrySchema);