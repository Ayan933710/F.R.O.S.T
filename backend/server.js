const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');
const http = require('http');
const WebSocket = require('ws');
const Y = require('yjs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/api/v1/sync/crdt-binary', express.raw({ type: 'application/octet-stream', limit: '10mb' }));

const PORT = process.env.PORT || 5000;
const ML_URL = process.env.ML_URL || 'http://localhost:8000';
const JWT_SECRET = process.env.JWT_SECRET || 'icenet-secret-key-change-in-production';

// ─────────────────────────────────────────────────────────────────────────────
// §3.2  CRDT Sync Engine
// ─────────────────────────────────────────────────────────────────────────────
const globalDoc = new Y.Doc();
let persistTimer = null;
function schedulePersist() {
  if (!mongoReady) return;
  clearTimeout(persistTimer);
  persistTimer = setTimeout(async () => {
    try {
      const state = Buffer.from(Y.encodeStateAsUpdate(globalDoc));
      await CrdtSnapshot.findOneAndUpdate(
        { doc_id: 'global' },
        { doc_id: 'global', state, updated_at: new Date() },
        { upsert: true }
      );
    } catch (_) {}
  }, 2000);
}
globalDoc.on('update', schedulePersist);

const server = http.createServer(app);
const wssCrdt = new WebSocket.Server({ noServer: true });
const wssTelemetry = new WebSocket.Server({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname === '/crdt') {
    wssCrdt.handleUpgrade(request, socket, head, ws => wssCrdt.emit('connection', ws, request));
  } else if (url.pathname === '/telemetry') {
    wssTelemetry.handleUpgrade(request, socket, head, ws => wssTelemetry.emit('connection', ws, request));
  } else {
    wssCrdt.handleUpgrade(request, socket, head, ws => wssCrdt.emit('connection', ws, request));
  }
});

wssCrdt.on('connection', (ws) => {
  console.log('[CRDT-WS] client connected');
  const serverSV = Y.encodeStateVector(globalDoc);
  ws.send(JSON.stringify({ type: 'sv', sv: Array.from(serverSV) }));
  const fullUpdate = Y.encodeStateAsUpdate(globalDoc);
  ws.send(JSON.stringify({ type: 'update', update: Array.from(fullUpdate) }));

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw);
      if (msg.type === 'sv') {
        const clientSV = new Uint8Array(msg.sv);
        const diff = Y.encodeStateAsUpdate(globalDoc, clientSV);
        ws.send(JSON.stringify({ type: 'update', update: Array.from(diff) }));
        return;
      }
      if (msg.type === 'update') {
        const update = new Uint8Array(msg.update);
        Y.applyUpdate(globalDoc, update);
        wssCrdt.clients.forEach(c => {
          if (c !== ws && c.readyState === WebSocket.OPEN) {
            c.send(JSON.stringify({ type: 'update', update: msg.update }));
          }
        });
        return;
      }
    } catch (_) {
      const update = new Uint8Array(raw);
      Y.applyUpdate(globalDoc, update);
      wssCrdt.clients.forEach(c => {
        if (c !== ws && c.readyState === WebSocket.OPEN) c.send(raw);
      });
    }
  });
});

app.post('/api/v1/sync/crdt', (req, res) => {
  try {
    const { update, stateVector } = req.body;
    if (!update) return res.status(400).json({ error: 'Missing update field' });
    const updateBuf = new Uint8Array(update);
    Y.applyUpdate(globalDoc, updateBuf);
    let serverDiff = null;
    if (stateVector) {
      serverDiff = Array.from(Y.encodeStateAsUpdate(globalDoc, new Uint8Array(stateVector)));
    }
    const payload = JSON.stringify({ type: 'update', update: Array.from(updateBuf) });
    wssCrdt.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(payload); });
    res.json({ success: true, message: 'CRDT update merged', serverDiff });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/v1/sync/crdt/state', (_req, res) => {
  res.json({ state: Array.from(Y.encodeStateAsUpdate(globalDoc)) });
});

// ─────────────────────────────────────────────────────────────────────────────
// MongoDB
// ─────────────────────────────────────────────────────────────────────────────
let mongoReady = false;
mongoose.set('bufferCommands', false);
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/icenet', {
  serverSelectionTimeoutMS: 2000,
}).then(async () => {
  mongoReady = true;
  console.log('MongoDB Connected');
  try {
    const snap = await CrdtSnapshot.findOne({ doc_id: 'global' });
    if (snap && snap.state) {
      Y.applyUpdate(globalDoc, new Uint8Array(snap.state));
      console.log('[CRDT] Restored canonical doc from MongoDB snapshot');
    }
  } catch (_) {}
}).catch(err => console.log('MongoDB unavailable — in-memory store.', err.message));

// ── Schemas ─────────────────────────────────────────────────────────────────
const CrdtSnapshotSchema = new mongoose.Schema({ doc_id: { type: String, unique: true }, state: Buffer, updated_at: Date });
const CrdtSnapshot = mongoose.model('CrdtSnapshot', CrdtSnapshotSchema);

const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password_hash: String,
  name: String,
  role: { type: String, enum: ['admin', 'commander'], default: 'commander' },
  station: String,
  created_at: { type: Date, default: Date.now },
});
const User = mongoose.model('User', UserSchema);

const ExpeditionSchema = new mongoose.Schema({
  expedition_id: { type: String, unique: true },
  name: String,
  season: String,
  start_date: Date,
  end_date: Date,
  milestones: Array,
  budget: Array,
  status: { type: String, default: 'Planning' },
});
const Expedition = mongoose.model('Expedition', ExpeditionSchema);

const RosterSchema = new mongoose.Schema({
  personnel_id: { type: String, unique: true },
  name: String,
  role: String,
  specialization: String,
  team: { type: String, enum: ['Summer', 'Winter-Over'] },
  expedition_id: String,
  blood_type: String,
  allergies: String,
  station: String,
});
const Roster = mongoose.model('Roster', RosterSchema);

const GeofenceSchema = new mongoose.Schema({
  geofence_id: { type: String, unique: true },
  name: String,
  type: { type: String, default: 'crevasse' },
  coordinates: Array,
  station: String,
  active: { type: Boolean, default: true },
});
const Geofence = mongoose.model('Geofence', GeofenceSchema);

const ItemSchema = new mongoose.Schema({
  item_id: String, name: String, category: String, quantity: Number,
  unit: String, station: String, critical_threshold: Number, last_updated: Date,
});
const Item = mongoose.model('Item', ItemSchema);

const VALID_STATUSES = ['Draft','Procured','Packed (Goa)','In Transit (Ocean)','Awaiting Heli-lift','Delivered (Base)'];
const ManifestSchema = new mongoose.Schema({
  manifest_id: { type: String, unique: true, required: true },
  status: { type: String, enum: VALID_STATUSES, default: 'Draft' },
  items: { type: Array, required: true },
  vessel_mmsi: String,
  crypto_hash: { type: String, default: null },
  sealed_at: { type: Date, default: null },
  sealed_payload_json: { type: String, default: null },
  tamper_detected: { type: Boolean, default: false },
  tamper_alerts: { type: Array, default: [] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});
const Manifest = mongoose.model('Manifest', ManifestSchema);

const TelemetrySchema = new mongoose.Schema({
  node_id: String, personnel_id: String, lat: Number, lng: Number,
  battery_pct: Number, status: String, timestamp: Date,
});
const Telemetry = mongoose.model('Telemetry', TelemetrySchema);

// ─────────────────────────────────────────────────────────────────────────────
// JWT Auth
// ─────────────────────────────────────────────────────────────────────────────
// In-memory user store fallback
const usersMemory = {};

// Seed default users on startup
(async () => {
  const defaults = [
    { username: 'admin', password: 'admin123', name: 'Dr. Anil Kumar (MoES Director)', role: 'admin', station: 'Goa HQ' },
    { username: 'commander', password: 'commander123', name: 'Col. Vikram Singh (Base Commander)', role: 'commander', station: 'Maitri' },
  ];
  for (const u of defaults) {
    const hash = await bcrypt.hash(u.password, 10);
    const data = { username: u.username, password_hash: hash, name: u.name, role: u.role, station: u.station };
    if (mongoReady) {
      try { await User.findOneAndUpdate({ username: u.username }, data, { upsert: true }); } catch (_) {}
    }
    usersMemory[u.username] = data;
  }
  console.log('[Auth] Default users seeded (admin / commander)');
})();

app.post('/api/v1/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  let user;
  if (mongoReady) { try { user = await User.findOne({ username }); } catch (_) {} }
  if (!user) user = usersMemory[username];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username: user.username, role: user.role, station: user.station, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token, user: { username: user.username, role: user.role, station: user.station, name: user.name } });
});

app.get('/api/v1/auth/me', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'No token' });
  try {
    const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
    res.json(decoded);
  } catch (_) { res.status(401).json({ error: 'Invalid token' }); }
});

function authMiddleware(roles) {
  return (req, res, next) => {
    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ error: 'Auth required' });
    try {
      const decoded = jwt.verify(auth.replace('Bearer ', ''), JWT_SECRET);
      if (roles && !roles.includes(decoded.role)) return res.status(403).json({ error: 'Insufficient role' });
      req.user = decoded;
      next();
    } catch (_) { res.status(401).json({ error: 'Invalid token' }); }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Expeditions CRUD
// ─────────────────────────────────────────────────────────────────────────────
const expeditionsMemory = {};

// Seed sample expedition
(() => {
  const sample = {
    expedition_id: 'ISEA-46',
    name: '46th Indian Scientific Expedition to Antarctica',
    season: '2026-27',
    start_date: new Date('2026-11-01'),
    end_date: new Date('2027-04-15'),
    status: 'Planning',
    milestones: [
      { id: 'm1', name: 'Procurement Complete', date: '2026-09-30', status: 'done', progress: 100 },
      { id: 'm2', name: 'Cargo Packed (Goa)', date: '2026-10-15', status: 'in-progress', progress: 65 },
      { id: 'm3', name: 'Cape Town Staging', date: '2026-11-05', status: 'pending', progress: 0 },
      { id: 'm4', name: 'DROMLAN Flight Departure', date: '2026-11-20', status: 'pending', progress: 0 },
      { id: 'm5', name: 'Ice Shelf Delivery', date: '2026-12-01', status: 'pending', progress: 0 },
      { id: 'm6', name: 'Summer Team Operational', date: '2026-12-15', status: 'pending', progress: 0 },
      { id: 'm7', name: 'Winter-Over Handoff', date: '2027-03-01', status: 'pending', progress: 0 },
    ],
    budget: [
      { id: 'b1', category: 'Chartered Flights (DROMLAN)', amount: 4500000, spent: 2250000, currency: 'INR' },
      { id: 'b2', category: 'Ice-class Vessel Charter', amount: 12000000, spent: 6000000, currency: 'INR' },
      { id: 'b3', category: 'Scientific Equipment', amount: 8550000, spent: 3420000, currency: 'INR' },
      { id: 'b4', category: 'Provisions & Consumables', amount: 3200000, spent: 1920000, currency: 'INR' },
      { id: 'b5', category: 'Personnel Deployment', amount: 2800000, spent: 840000, currency: 'INR' },
    ],
  };
  expeditionsMemory[sample.expedition_id] = sample;
})();

app.get('/api/v1/expeditions', (req, res) => res.json(Object.values(expeditionsMemory)));
app.get('/api/v1/expeditions/:id', (req, res) => {
  const e = expeditionsMemory[req.params.id];
  if (!e) return res.status(404).json({ error: 'Not found' });
  res.json(e);
});
app.post('/api/v1/expeditions', (req, res) => {
  const data = { ...req.body, expedition_id: req.body.expedition_id || `EXP-${Date.now()}` };
  expeditionsMemory[data.expedition_id] = data;
  res.json({ success: true, expedition: data });
});
app.patch('/api/v1/expeditions/:id', (req, res) => {
  if (!expeditionsMemory[req.params.id]) return res.status(404).json({ error: 'Not found' });
  Object.assign(expeditionsMemory[req.params.id], req.body, { updated_at: new Date() });
  res.json({ success: true, expedition: expeditionsMemory[req.params.id] });
});

// ─────────────────────────────────────────────────────────────────────────────
// Roster CRUD
// ─────────────────────────────────────────────────────────────────────────────
const rosterMemory = {};

// Seed sample personnel
(() => {
  const people = [
    { personnel_id: 'DR-SHARMA-01', name: 'Dr. Priya Sharma', role: 'Medical Officer', specialization: 'Emergency Medicine', team: 'Winter-Over', expedition_id: 'ISEA-46', blood_type: 'O+', allergies: 'None', station: 'Maitri' },
    { personnel_id: 'ENG-PATIL-02', name: 'Eng. Rajesh Patil', role: 'Mechanical Engineer', specialization: 'Power Systems', team: 'Summer', expedition_id: 'ISEA-46', blood_type: 'A+', allergies: 'Penicillin', station: 'Maitri' },
    { personnel_id: 'SCI-GUPTA-03', name: 'Dr. Anita Gupta', role: 'Glaciologist', specialization: 'Ice Core Analysis', team: 'Summer', expedition_id: 'ISEA-46', blood_type: 'B+', allergies: 'None', station: 'Bharati' },
    { personnel_id: 'EXP-BIO-04', name: 'Dr. Vikram Nair', role: 'Marine Biologist', specialization: 'Southern Ocean Ecology', team: 'Summer', expedition_id: 'ISEA-46', blood_type: 'AB-', allergies: 'Sulfa drugs', station: 'Maitri' },
    { personnel_id: 'TECH-DAS-05', name: 'Suresh Das', role: 'IT & Communications', specialization: 'Satellite Systems', team: 'Winter-Over', expedition_id: 'ISEA-46', blood_type: 'O-', allergies: 'None', station: 'Maitri' },
    { personnel_id: 'COOK-KUMAR-06', name: 'Ravi Kumar', role: 'Chef', specialization: 'High-Altitude Nutrition', team: 'Winter-Over', expedition_id: 'ISEA-46', blood_type: 'A-', allergies: 'Shellfish', station: 'Maitri' },
  ];
  people.forEach(p => rosterMemory[p.personnel_id] = p);
})();

app.get('/api/v1/roster', (req, res) => res.json(Object.values(rosterMemory)));
app.get('/api/v1/roster/:id', (req, res) => {
  const r = rosterMemory[req.params.id];
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json(r);
});
app.post('/api/v1/roster', (req, res) => {
  const data = { ...req.body, personnel_id: req.body.personnel_id || `PER-${Date.now()}` };
  rosterMemory[data.personnel_id] = data;
  res.json({ success: true, personnel: data });
});
app.patch('/api/v1/roster/:id', (req, res) => {
  if (!rosterMemory[req.params.id]) return res.status(404).json({ error: 'Not found' });
  Object.assign(rosterMemory[req.params.id], req.body);
  res.json({ success: true, personnel: rosterMemory[req.params.id] });
});
app.delete('/api/v1/roster/:id', (req, res) => {
  delete rosterMemory[req.params.id];
  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Geofence CRUD
// ─────────────────────────────────────────────────────────────────────────────
const geofenceMemory = {};

(() => {
  geofenceMemory['GF-001'] = {
    geofence_id: 'GF-001', name: 'Crevasse Field Alpha', type: 'crevasse',
    coordinates: [[-70.770, 11.730], [-70.770, 11.740], [-70.765, 11.740], [-70.765, 11.730]],
    station: 'Maitri', active: true,
  };
  geofenceMemory['GF-002'] = {
    geofence_id: 'GF-002', name: 'Thin Ice Zone Bravo', type: 'thin_ice',
    coordinates: [[-70.775, 11.720], [-70.775, 11.735], [-70.772, 11.735], [-70.772, 11.720]],
    station: 'Maitri', active: true,
  };
})();

app.get('/api/v1/geofences', (req, res) => res.json(Object.values(geofenceMemory)));
app.post('/api/v1/geofences', (req, res) => {
  const data = { ...req.body, geofence_id: req.body.geofence_id || `GF-${Date.now()}` };
  geofenceMemory[data.geofence_id] = data;
  res.json({ success: true, geofence: data });
});
app.delete('/api/v1/geofences/:id', (req, res) => {
  delete geofenceMemory[req.params.id];
  res.json({ success: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// Marine AIS Proxy (mock for demo)
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/ais/vessel/:mmsi', (req, res) => {
  // Mock AIS data for the chartered vessel
  const mmsi = req.params.mmsi;
  const baseData = {
    mmsi,
    vessel_name: 'MV Vasily Golovnin',
    flag: 'Russia',
    type: 'Ice-Class Cargo',
    // Simulated position in Southern Ocean
    lat: -55.0 - Math.random() * 10,
    lng: 20.0 + Math.random() * 30,
    speed_knots: 12 + Math.random() * 5,
    heading: 180 + Math.random() * 30,
    destination: 'Maitri Station, Antarctica',
    eta: new Date(Date.now() + 14 * 86400000).toISOString(),
    last_update: new Date().toISOString(),
  };
  res.json(baseData);
});

// ─────────────────────────────────────────────────────────────────────────────
// LoRa Gateway Simulator Endpoint
// ─────────────────────────────────────────────────────────────────────────────
let loraSimInterval = null;
app.post('/api/v1/simulator/lora/start', (req, res) => {
  if (loraSimInterval) return res.json({ message: 'Already running' });
  const personnel = Object.values(rosterMemory);
  let tick = 0;

  loraSimInterval = setInterval(() => {
    tick++;
    personnel.forEach(p => {
      const jitter = () => (Math.random() - 0.5) * 0.005;
      const payload = {
        node_id: p.personnel_id,
        personnel_id: p.personnel_id,
        lat: -70.768 + jitter() + tick * 0.0001,
        lng: 11.734 + jitter(),
        battery_pct: Math.max(10, 100 - tick * 2 + Math.floor(Math.random() * 5)),
        status: 'ACTIVE',
        barometric_pressure: 980 + Math.random() * 20,
        timestamp: new Date().toISOString(),
      };
      const dataStr = JSON.stringify({ type: 'telemetry', data: payload });
      wssTelemetry.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(dataStr); });
      wssCrdt.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(dataStr); });
    });
  }, 15000); // 15-second intervals

  res.json({ success: true, message: `LoRa simulator started for ${personnel.length} nodes at 15s intervals` });
});

app.post('/api/v1/simulator/lora/stop', (req, res) => {
  clearInterval(loraSimInterval);
  loraSimInterval = null;
  res.json({ success: true, message: 'LoRa simulator stopped' });
});

app.post('/api/v1/simulator/lora/sos', (req, res) => {
  const { personnel_id } = req.body;
  const person = rosterMemory[personnel_id] || rosterMemory['EXP-BIO-04'];
  const payload = {
    node_id: person.personnel_id,
    personnel_id: person.personnel_id,
    lat: -70.768 + (Math.random() - 0.5) * 0.01,
    lng: 11.734 + (Math.random() - 0.5) * 0.01,
    battery_pct: Math.floor(Math.random() * 15) + 3,
    status: 'SOS',
    barometric_pressure: 960 + Math.random() * 10,
    timestamp: new Date().toISOString(),
    blood_type: person.blood_type,
    allergies: person.allergies,
    name: person.name,
    role: person.role,
  };
  const dataStr = JSON.stringify({ type: 'telemetry', data: payload });
  wssTelemetry.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(dataStr); });
  wssCrdt.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(dataStr); });
  res.json({ success: true, payload });
});

// ─────────────────────────────────────────────────────────────────────────────
// Automatic Weather Station (AWS) Mock Feed
// ─────────────────────────────────────────────────────────────────────────────
app.get('/api/v1/aws/current', (req, res) => {
  // Simulate live weather changing slowly over time
  const t = Date.now() / 60000; // minutes
  const baseTemp = -20;
  const tempVary = Math.sin(t * 0.1) * 10;
  
  const baseWind = 8;
  const windVary = Math.abs(Math.sin(t * 0.5) * 15);
  
  const basePressure = 980;
  const pressureVary = Math.cos(t * 0.05) * 20;

  res.json({
    timestamp: new Date().toISOString(),
    station: 'Maitri-AWS-01',
    temperature: parseFloat((baseTemp + tempVary).toFixed(1)), // -30 to -10
    U10: parseFloat((baseWind + windVary).toFixed(1)),         // 8 to 23 m/s
    pressure_drop: parseFloat((Math.cos(t * 0.1) * 3).toFixed(1)), // -3 to 3 hPa/3hr
    humidity: parseFloat((60 + Math.sin(t * 0.2) * 20).toFixed(1)) // 40 to 80%
  });
});


// ─────────────────────────────────────────────────────────────────────────────
// §3.1  Immutable Cargo Ledger
// ─────────────────────────────────────────────────────────────────────────────
function canonicalJsonStringify(value) {
  if (value === null || value === undefined) return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(v => canonicalJsonStringify(v)).join(',') + ']';
  if (typeof value === 'object' && !(value instanceof Date)) {
    const keys = Object.keys(value).sort();
    return '{' + keys.map(k => JSON.stringify(k) + ':' + canonicalJsonStringify(value[k])).join(',') + '}';
  }
  return JSON.stringify(value);
}

const manifestsMemory = {};
async function findManifest(id) {
  if (mongoReady) { try { const doc = await Manifest.findOne({ manifest_id: id }); if (doc) return doc; } catch (_) {} }
  return manifestsMemory[id] || null;
}
async function saveManifest(manifest) {
  if (mongoReady && typeof manifest.save === 'function') { try { await manifest.save(); return; } catch (_) {} }
  manifestsMemory[manifest.manifest_id] = manifest;
}

app.post('/api/v1/cargo/manifest', async (req, res) => {
  const { manifest_id, items, vessel_mmsi } = req.body;
  if (!manifest_id || !items) return res.status(400).json({ error: 'manifest_id and items required' });
  const existing = await findManifest(manifest_id);
  if (existing) return res.status(409).json({ error: 'Manifest already exists' });
  const data = { manifest_id, status: 'Draft', items, vessel_mmsi: vessel_mmsi || null, crypto_hash: null, sealed_at: null, sealed_payload_json: null, tamper_detected: false, tamper_alerts: [], created_at: new Date(), updated_at: new Date() };
  if (mongoReady) { try { const m = new Manifest(data); await m.save(); return res.json({ success: true, manifest: m }); } catch (_) {} }
  manifestsMemory[manifest_id] = data;
  res.json({ success: true, manifest: data });
});

app.post('/api/v1/cargo/manifest/:id/seal', async (req, res) => {
  const manifest = await findManifest(req.params.id);
  if (!manifest) return res.status(404).json({ error: 'Manifest not found' });
  if (manifest.crypto_hash) return res.status(409).json({ error: 'Already sealed' });
  const payloadObj = { manifest_id: manifest.manifest_id, items: manifest.items, vessel_mmsi: manifest.vessel_mmsi };
  const canonicalJson = canonicalJsonStringify(payloadObj);
  const hash = crypto.createHash('sha256').update(canonicalJson, 'utf8').digest('hex');
  manifest.crypto_hash = hash; manifest.sealed_at = new Date(); manifest.sealed_payload_json = canonicalJson;
  manifest.status = 'Packed (Goa)'; manifest.updated_at = new Date();
  await saveManifest(manifest);
  res.json({ success: true, crypto_hash: hash, sealed_payload: canonicalJson, manifest });
});

app.patch('/api/v1/cargo/manifest/:id/status', async (req, res) => {
  const { status: newStatus } = req.body;
  if (!VALID_STATUSES.includes(newStatus)) return res.status(400).json({ error: 'Invalid status' });
  const manifest = await findManifest(req.params.id);
  if (!manifest) return res.status(404).json({ error: 'Not found' });
  const curIdx = VALID_STATUSES.indexOf(manifest.status);
  const tgtIdx = VALID_STATUSES.indexOf(newStatus);
  if (tgtIdx <= curIdx) return res.status(400).json({ error: `Cannot move backward` });
  if (tgtIdx >= 2 && !manifest.crypto_hash) return res.status(400).json({ error: 'Must seal first' });
  manifest.status = newStatus; manifest.updated_at = new Date();
  await saveManifest(manifest);
  res.json({ success: true, manifest });
});

app.post('/api/v1/cargo/verify', async (req, res) => {
  const { manifest_id, items, vessel_mmsi } = req.body;
  if (!manifest_id || !items) return res.status(400).json({ error: 'manifest_id and items required' });
  const manifest = await findManifest(manifest_id);
  if (!manifest) return res.status(404).json({ error: 'Not found' });
  if (!manifest.crypto_hash) return res.status(400).json({ error: 'Never sealed' });
  const incomingPayload = { manifest_id, items, vessel_mmsi: vessel_mmsi || manifest.vessel_mmsi };
  const incomingCanonical = canonicalJsonStringify(incomingPayload);
  const incomingHash = crypto.createHash('sha256').update(incomingCanonical, 'utf8').digest('hex');
  if (incomingHash !== manifest.crypto_hash) {
    const alert = { detected_at: new Date(), incoming_hash: incomingHash, stored_hash: manifest.crypto_hash, details: `Sealed: ${manifest.sealed_payload_json} | Incoming: ${incomingCanonical}` };
    if (!manifest.tamper_alerts) manifest.tamper_alerts = [];
    manifest.tamper_alerts.push(alert); manifest.tamper_detected = true; manifest.updated_at = new Date();
    await saveManifest(manifest);
    return res.status(400).json({ error: 'TAMPER ALERT', hash_mismatch: true, stored_hash: manifest.crypto_hash, incoming_hash: incomingHash, sealed_payload: manifest.sealed_payload_json, incoming_payload: incomingCanonical, alert });
  }
  if (manifest.status !== 'Delivered (Base)') { manifest.status = 'Delivered (Base)'; manifest.updated_at = new Date(); await saveManifest(manifest); }
  res.json({ success: true, message: 'Integrity verified', stored_hash: manifest.crypto_hash, incoming_hash: incomingHash });
});

app.get('/api/v1/cargo/manifest/:id', async (req, res) => {
  const m = await findManifest(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  res.json(m);
});
app.get('/api/v1/cargo/manifests', async (req, res) => {
  if (mongoReady) { try { return res.json(await Manifest.find({})); } catch (_) {} }
  res.json(Object.values(manifestsMemory));
});

// ─────────────────────────────────────────────────────────────────────────────
// Telemetry + ML + Inventory
// ─────────────────────────────────────────────────────────────────────────────
app.post('/api/v1/telemetry/ingest', async (req, res) => {
  const dataStr = JSON.stringify({ type: 'telemetry', data: req.body });
  wssTelemetry.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(dataStr); });
  wssCrdt.clients.forEach(c => { if (c.readyState === WebSocket.OPEN) c.send(dataStr); });
  if (mongoReady) { try { await new Telemetry(req.body).save(); } catch (_) {} }
  res.json({ success: true });
});

app.get('/api/v1/ml/predict-window', async (req, res) => {
  try { const r = await axios.get(`${ML_URL}/predict-window`, { params: req.query }); res.json(r.data); }
  catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/v1/inventory', async (req, res) => {
  if (mongoReady) { 
    try { 
      let items = await Item.find({});
      // Auto-seed if empty
      if (items.length === 0) {
        const seed = [
          { item_id: '1', name: 'Aviation Turbine Fuel (ATF)', category: 'Fuel', quantity: 15000, unit: 'Liters', threshold: 2000, station: 'Maitri' },
          { item_id: '2', name: 'Epinephrine', category: 'Medical', quantity: 50, unit: 'Vials', threshold: 10, station: 'Maitri' },
          { item_id: '3', name: 'Generator Bearings', category: 'Technical Spares', quantity: 12, unit: 'Units', threshold: 5, station: 'Maitri' },
          { item_id: '4', name: 'Freeze-Dried Rations', category: 'Perishables', quantity: 800, unit: 'Packs', threshold: 200, station: 'Maitri' },
          { item_id: '5', name: 'Diesel (Ground Transport)', category: 'Fuel', quantity: 8000, unit: 'Liters', threshold: 1500, station: 'Maitri' },
          { item_id: '6', name: 'Ibuprofen Tablets', category: 'Medical', quantity: 300, unit: 'Tabs', threshold: 50, station: 'Maitri' },
          { item_id: '7', name: 'Microscope', category: 'Equipment', quantity: 2, unit: 'Units', threshold: 1, station: 'Maitri' }
        ];
        await Item.insertMany(seed);
        items = seed;
      }
      return res.json(items.map(i => ({...i, qty: i.quantity}))); // map quantity to qty for consistency if needed
    } catch (_) {} 
  }
  // Memory fallback
  res.json([
    { item_id: '1', name: 'Aviation Turbine Fuel (ATF)', category: 'Fuel', qty: 15000, unit: 'Liters' },
    { item_id: '2', name: 'Epinephrine', category: 'Medical', qty: 50, unit: 'Vials' },
    { item_id: '3', name: 'Generator Bearings', category: 'Technical Spares', qty: 12, unit: 'Units' },
    { item_id: '7', name: 'Microscope', category: 'Equipment', qty: 2, unit: 'Units' }
  ]);
});
app.post('/api/v1/inventory', async (req, res) => {
  if (mongoReady) { try { const i = new Item(req.body); await i.save(); return res.json(i); } catch (_) {} }
  res.json(req.body);
});

// ─────────────────────────────────────────────────────────────────────────────
server.listen(PORT, () => console.log(`ICE-NET Node server running on port ${PORT}`));
