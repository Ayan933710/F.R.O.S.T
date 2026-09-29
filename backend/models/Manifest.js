const mongoose = require('mongoose');

const ManifestSchema = new mongoose.Schema({
  manifest_id: { type: String, unique: true, required: true },
  status: { type: String, default: 'Draft' },
  items: { type: mongoose.Schema.Types.Mixed, required: true },
  destination: { type: String },
  vessel: { type: String },
  vessel_mmsi: { type: String },
  crypto_hash: { type: String },
  sealed_at: { type: Date },
  sealed_payload_json: { type: String },
  tamper_detected: { type: Boolean, default: false },
  tamper_alerts: { type: mongoose.Schema.Types.Mixed, default: [] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Manifest', ManifestSchema);