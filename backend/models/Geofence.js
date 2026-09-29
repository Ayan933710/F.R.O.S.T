const mongoose = require('mongoose');

const GeofenceSchema = new mongoose.Schema({
  geofence_id: { type: String, unique: true, required: true },
  name: { type: String },
  type: { type: String, default: 'crevasse' },
  coordinates: { type: mongoose.Schema.Types.Mixed },
  station: { type: String },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Geofence', GeofenceSchema);