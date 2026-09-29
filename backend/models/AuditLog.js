const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  log_id: { type: String, unique: true, required: true },
  timestamp: { type: Date, default: Date.now },
  category: { type: String, required: true },
  action: { type: String, required: true },
  severity: { type: String, default: 'info' },
  admin_id: { type: String },
  commander_id: { type: String },
  details: { type: String },
  status: { type: String },
  signature_hash: { type: String }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema);