const mongoose = require('mongoose');

const CrdtSnapshotSchema = new mongoose.Schema({
  doc_id: { type: String, unique: true, required: true },
  state: { type: Buffer },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CrdtSnapshot', CrdtSnapshotSchema);