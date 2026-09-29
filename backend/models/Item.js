const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  item_id: { type: String },
  name: { type: String },
  category: { type: String },
  quantity: { type: Number },
  unit: { type: String },
  station: { type: String },
  critical_threshold: { type: Number },
  last_updated: { type: Date }
});

module.exports = mongoose.model('Item', ItemSchema);