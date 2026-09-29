const mongoose = require('mongoose');

const RequisitionSchema = new mongoose.Schema({
  requisition_id: { type: String, unique: true, required: true },
  station: { type: String, required: true, index: true },
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String },
  urgency: { type: String, default: 'ROUTINE' },
  status: { type: String, default: 'PENDING_APPROVAL' },
  decided_by: { type: String },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Requisition', RequisitionSchema);