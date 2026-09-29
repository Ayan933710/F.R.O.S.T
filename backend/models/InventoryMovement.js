const mongoose = require('mongoose');

const InventoryMovementSchema = new mongoose.Schema({
  client_event_id: { type: String, unique: true, sparse: true },
  station: { type: String, required: true, index: true },
  item_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  category: { type: String },
  unit: { type: String },
  quantity_delta: { type: Number, required: true },
  stock_after: { type: Number, required: true },
  critical_threshold: { type: Number },
  lead_time_days: { type: Number },
  unit_cost: { type: Number },
  movement_type: { type: String, required: true },
  event_type: { type: String },
  recorded_at: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('InventoryMovement', InventoryMovementSchema);