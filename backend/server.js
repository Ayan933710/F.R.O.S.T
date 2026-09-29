const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs/promises');
const path = require('path');
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
  charter_schedule: Array,
  budget_allocation: Array,
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

const InventoryMovementSchema = new mongoose.Schema({
  client_event_id: { type: String, unique: true, sparse: true },
  station: { type: String, required: true, index: true },
  item_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  category: String,
  unit: String,
  quantity_delta: { type: Number, required: true },
  stock_after: { type: Number, required: true },
  critical_threshold: Number,
  lead_time_days: Number,
  unit_cost: Number,
  movement_type: { type: String, enum: ['snapshot', 'consumption', 'restock', 'adjustment', 'disposal'], required: true },
  event_type: { type: String, enum: ['snapshot', 'adjustment'], required: true },
  recorded_at: { type: Date, default: Date.now, index: true },
});
const InventoryMovement = mongoose.model('InventoryMovement', InventoryMovementSchema);
const inventoryMovementsMemory = [];
const inventoryMovementFile = path.join(__dirname, 'data', 'inventory-movements.json');
let inventoryMovementWrite = Promise.resolve();
const inventoryMovementStoreReady = fs.readFile(inventoryMovementFile, 'utf8')
  .then(contents => {
    const records = JSON.parse(contents);
    if (Array.isArray(records)) inventoryMovementsMemory.push(...records);
  })
  .catch(error => {
    if (error.code !== 'ENOENT') console.error('Unable to load inventory movement file:', error.message);
  });

async function saveInventoryMovement(movement) {
  await inventoryMovementStoreReady;
  if (movement.client_event_id) {
    const localDuplicate = inventoryMovementsMemory.find(record => record.client_event_id === movement.client_event_id);
    if (localDuplicate) return { movement: localDuplicate, duplicate: true };
    if (mongoReady) {
      try {
        const databaseDuplicate = await InventoryMovement.findOne({ client_event_id: movement.client_event_id }).lean();
        if (databaseDuplicate) return { movement: databaseDuplicate, duplicate: true };
      } catch (_) {}
    }
  }

  if (mongoReady) {
    try {
      const saved = await InventoryMovement.create(movement);
      return { movement: saved.toObject(), duplicate: false };
    } catch (error) {
      if (error.code === 11000 && movement.client_event_id) {
        const duplicate = await InventoryMovement.findOne({ client_event_id: movement.client_event_id }).lean();
        if (duplicate) return { movement: duplicate, duplicate: true };
      }
    }
  }

  const write = inventoryMovementWrite.then(async () => {
    if (movement.client_event_id) {
      const duplicate = inventoryMovementsMemory.find(record => record.client_event_id === movement.client_event_id);
      if (duplicate) return { movement: duplicate, duplicate: true };
    }
    const updatedRecords = [...inventoryMovementsMemory, movement];
    await fs.mkdir(path.dirname(inventoryMovementFile), { recursive: true });
    const temporaryFile = `${inventoryMovementFile}.tmp`;
    await fs.writeFile(temporaryFile, JSON.stringify(updatedRecords, null, 2));
    await fs.rename(temporaryFile, inventoryMovementFile);
    inventoryMovementsMemory.push(movement);
    return { movement, duplicate: false };
  });
  inventoryMovementWrite = write.catch(() => {});
  return write;
}

const RequisitionSchema = new mongoose.Schema({
  requisition_id: { type: String, unique: true, required: true },
  station: { type: String, required: true, index: true },
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: String,
  urgency: { type: String, enum: ['ROUTINE', 'CRITICAL'], default: 'ROUTINE' },
  status: { type: String, enum: ['PENDING_APPROVAL', 'APPROVED', 'DENIED'], default: 'PENDING_APPROVAL' },
  decided_by: String,
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now },
});
const Requisition = mongoose.model('Requisition', RequisitionSchema);
const requisitionsMemory = [];
const requisitionStoreFile = path.join(__dirname, 'data', 'requisitions.json');
let requisitionWriteQueue = Promise.resolve();
const requisitionStoreReady = fs.readFile(requisitionStoreFile, 'utf8')
  .then(contents => {
    const records = JSON.parse(contents);
    if (Array.isArray(records)) requisitionsMemory.push(...records);
  })
  .catch(error => {
    if (error.code !== 'ENOENT') console.error('Unable to load requisition file:', error.message);
  });

async function persistRequisitions() {
  await requisitionStoreReady;
  const write = requisitionWriteQueue.then(async () => {
    await fs.mkdir(path.dirname(requisitionStoreFile), { recursive: true });
    const temporaryFile = `${requisitionStoreFile}.tmp`;
    await fs.writeFile(temporaryFile, JSON.stringify(requisitionsMemory, null, 2));
    await fs.rename(temporaryFile, requisitionStoreFile);
  });
  requisitionWriteQueue = write.catch(() => {});
  await write;
}

const VALID_STATUSES = ['Draft','Procured','Packed (Goa)','In Transit (Ocean)','Awaiting Heli-lift','Delivered (Base)'];
const ManifestSchema = new mongoose.Schema({
  manifest_id: { type: String, unique: true, required: true },
  status: { type: String, enum: VALID_STATUSES, default: 'Draft' },
  items: { type: Array, required: true },
  destination: String,
  vessel: String,
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
// Research Centers Detail Data
// ─────────────────────────────────────────────────────────────────────────────
const researchCentersMemory = {};
(() => {
  const centers = [
    {
      id: 'maitri',
      name: 'Maitri Station',
      coords: '70°46′S, 11°44′E',
      region: 'Schirmacher Oasis, Antarctica',
      crew: 25,
      temp: -34,
      power: 96,
      status: 'Operational',
      alert: 'Stable ice shelf conditions',
      leader: 'Dr. Aisha Malik',
      summary: 'Primary glaciology and atmospheric chemistry operations continue with full payload capacity and no transport restrictions.',
      weather: {
        condition: 'Clear / light katabatic flow',
        wind: 24,
        humidity: 58,
        visibility: '7.2 km',
        pressure: 1014,
        risk: 'Low',
      },
      rosters: [
        { name: 'Leena Reddy', role: 'Station Lead', shift: 'Day', status: 'On station' },
        { name: 'Omar Haddad', role: 'Glaciology Lead', shift: 'Day', status: 'In field' },
        { name: 'Priya Nair', role: 'Meteorology Analyst', shift: 'Night', status: 'Monitoring' },
        { name: 'Milan Sethi', role: 'Power Systems', shift: 'Day', status: 'On station' },
        { name: 'Tariq Chen', role: 'Logistics Officer', shift: 'Night', status: 'On call' },
      ],
      logistics: {
        batteryReserve: '82%',
        sensorHealth: 'Optimal',
        nextMaintenance: 'Tomorrow, 09:30 UTC',
        runwayStatus: 'Open',
      },
    },
    {
      id: 'bharati',
      name: 'Bharati Station',
      coords: '69°24′S, 76°12′E',
      region: 'Larsemann Hills, Antarctica',
      crew: 18,
      temp: -41,
      power: 92,
      status: 'Operational',
      alert: 'Cold front moving east',
      leader: 'Capt. Ishan Verma',
      summary: 'Field teams are active with a moderate snow squall watch, but all research and power systems remain stable.',
      weather: {
        condition: 'Snow squall watch',
        wind: 31,
        humidity: 73,
        visibility: '3.4 km',
        pressure: 1002,
        risk: 'Moderate',
      },
      rosters: [
        { name: 'Nadia Foster', role: 'Station Operations', shift: 'Day', status: 'On station' },
        { name: 'Arjun Patel', role: 'Ice Core Team', shift: 'Day', status: 'In field' },
        { name: 'Elena Rossi', role: 'Climate Systems', shift: 'Night', status: 'Monitoring' },
        { name: 'Siddharth Rao', role: 'Facility Tech', shift: 'Day', status: 'On station' },
      ],
      logistics: {
        batteryReserve: '76%',
        sensorHealth: 'Nominal',
        nextMaintenance: 'Today, 18:00 UTC',
        runwayStatus: 'Limited access',
      },
    },
    {
      id: 'himadri',
      name: 'Himadri Station',
      coords: '78°55′N, 11°56′E',
      region: 'Ny-Ålesund, Svalbard',
      crew: 12,
      temp: -8,
      power: 99,
      status: 'Operational',
      alert: 'Low wind, clear Arctic conditions',
      leader: 'Dr. Helena Berg',
      summary: 'Arctic atmospheric research is in a favorable window, with excellent visibility and normal ventilation operations.',
      weather: {
        condition: 'Clear with low cloud cover',
        wind: 12,
        humidity: 62,
        visibility: '10.1 km',
        pressure: 1018,
        risk: 'Low',
      },
      rosters: [
        { name: 'Jonas Eriksen', role: 'Scientific Lead', shift: 'Day', status: 'On station' },
        { name: 'Marta Novak', role: 'Ocean Sensors', shift: 'Day', status: 'Monitoring' },
        { name: 'Keisuke Sato', role: 'Energy Systems', shift: 'Night', status: 'On call' },
        { name: 'Alicia Moore', role: 'Field Technician', shift: 'Day', status: 'In field' },
      ],
      logistics: {
        batteryReserve: '89%',
        sensorHealth: 'Optimal',
        nextMaintenance: 'Thursday, 11:00 UTC',
        runwayStatus: 'Open',
      },
    },
  ];

  centers.forEach((center) => {
    researchCentersMemory[center.id] = center;
  });
})();

app.get('/api/v1/research-centers', (_req, res) => {
  res.json(Object.values(researchCentersMemory));
});

app.get('/api/v1/research-centers/:id', (req, res) => {
  const center = researchCentersMemory[req.params.id];
  if (!center) return res.status(404).json({ error: 'Research center not found' });
  res.json(center);
});

app.patch('/api/v1/research-centers/:id', (req, res) => {
  const center = researchCentersMemory[req.params.id];
  if (!center) return res.status(404).json({ error: 'Research center not found' });

  Object.assign(center, req.body);
  res.json({ success: true, center });
});

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
    charter_schedule: [
      { id: 'CHF-301', route: 'Cape Town → Maitri', date: '2026-10-05', duration: 8, offset: 0, status: 'Confirmed', window: 'Oct 1 - Oct 8' },
      { id: 'CHF-302', route: 'Christchurch → Bharati', date: '2026-10-12', duration: 12, offset: 3, status: 'Pending', window: 'Oct 4 - Oct 16' },
      { id: 'CHF-303', route: 'Tromsø → Himadri', date: '2026-10-18', duration: 5, offset: 6, status: 'Confirmed', window: 'Oct 7 - Oct 12' },
    ],
    budget_allocation: [
      { name: 'Charter Flights', value: 4.2, color: '#3B82F6' },
      { name: 'Cold Logistics', value: 1.8, color: '#F43F5E' },
      { name: 'Reserve', value: 2.1, color: '#4ade80' },
    ],
  };
  expeditionsMemory[sample.expedition_id] = sample;
})();

const expeditionStoreFile = path.join(__dirname, 'data', 'expeditions.json');
let expeditionWriteQueue = Promise.resolve();
const expeditionStoreReady = fs.readFile(expeditionStoreFile, 'utf8')
  .then(contents => {
    const records = JSON.parse(contents);
    if (Array.isArray(records)) {
      records.forEach(record => {
        expeditionsMemory[record.expedition_id] = {
          ...expeditionsMemory[record.expedition_id],
          ...record,
        };
      });
    }
  })
  .catch(error => {
    if (error.code !== 'ENOENT') console.error('Unable to load expedition file:', error.message);
  });

async function persistExpeditions() {
  await expeditionStoreReady;
  const write = expeditionWriteQueue.then(async () => {
    await fs.mkdir(path.dirname(expeditionStoreFile), { recursive: true });
    const temporaryFile = `${expeditionStoreFile}.tmp`;
    await fs.writeFile(temporaryFile, JSON.stringify(Object.values(expeditionsMemory), null, 2));
    await fs.rename(temporaryFile, expeditionStoreFile);
  });
  expeditionWriteQueue = write.catch(() => {});
  await write;
}

app.get('/api/v1/expeditions', async (req, res) => {
  await expeditionStoreReady;
  res.json(Object.values(expeditionsMemory));
});
app.get('/api/v1/expeditions/:id', async (req, res) => {
  await expeditionStoreReady;
  const e = expeditionsMemory[req.params.id];
  if (!e) return res.status(404).json({ error: 'Not found' });
  res.json(e);
});
app.post('/api/v1/expeditions', async (req, res) => {
  await expeditionStoreReady;
  const data = { ...req.body, expedition_id: req.body.expedition_id || `EXP-${Date.now()}` };
  expeditionsMemory[data.expedition_id] = data;
  try { await persistExpeditions(); } catch (error) { return res.status(500).json({ error: error.message }); }
  res.json({ success: true, expedition: data });
});
app.patch('/api/v1/expeditions/:id', async (req, res) => {
  await expeditionStoreReady;
  if (!expeditionsMemory[req.params.id]) return res.status(404).json({ error: 'Not found' });
  Object.assign(expeditionsMemory[req.params.id], req.body, { updated_at: new Date() });
  try { await persistExpeditions(); } catch (error) { return res.status(500).json({ error: error.message }); }
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
// Live weather proxy for Antarctic and Arctic stations
// ─────────────────────────────────────────────────────────────────────────────
const weatherStations = {
  maitri: { name: 'Maitri', latitude: -70.77, longitude: 11.74 },
  bharati: { name: 'Bharati', latitude: -69.41, longitude: 76.19 },
  himadri: { name: 'Himadri', latitude: 78.92, longitude: 11.93 },
};
const weatherCache = new Map();

app.get('/api/v1/aws/current', async (req, res) => {
  const stationId = String(req.query.station || 'maitri').toLowerCase();
  const station = weatherStations[stationId];
  if (!station) return res.status(400).json({ error: 'Unknown weather station', supported_stations: Object.keys(weatherStations) });

  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude: station.latitude,
        longitude: station.longitude,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,surface_pressure',
        hourly: 'surface_pressure,wind_speed_10m,visibility',
        wind_speed_unit: 'ms',
        past_days: 1,
        forecast_days: 7,
        timezone: 'UTC',
      },
      timeout: 12000,
    });

    const { current, hourly } = response.data;
    if (!current || !hourly?.time?.length) throw new Error('Weather provider returned incomplete station data');

    const toUtcMillis = value => new Date(/[zZ]|[+-]\d{2}:?\d{2}$/.test(value) ? value : `${value}Z`).getTime();
    const observedAt = toUtcMillis(current.time);
    let currentHourIndex = -1;
    let priorHourIndex = -1;
    hourly.time.forEach((time, index) => {
      const sampleTime = toUtcMillis(time);
      if (sampleTime <= observedAt) currentHourIndex = index;
      if (sampleTime <= observedAt - 3 * 60 * 60 * 1000) priorHourIndex = index;
    });

    if (currentHourIndex < 0 || priorHourIndex < 0) throw new Error('Weather provider lacks the pressure history needed for the model');

    const dailyWind = new Map();
    hourly.time.forEach((time, index) => {
      const day = time.slice(0, 10);
      const sampleTime = toUtcMillis(time);
      if (sampleTime < observedAt || sampleTime >= observedAt + 7 * 86400000) return;
      const wind = Number(hourly.wind_speed_10m?.[index]);
      if (!Number.isFinite(wind)) return;
      const samples = dailyWind.get(day) || [];
      samples.push(wind * 3.6);
      dailyWind.set(day, samples);
    });

    const pressureNow = Number(current.surface_pressure);
    const pressureThreeHoursAgo = Number(hourly.surface_pressure[priorHourIndex]);
    const windSpeed = Number(current.wind_speed_10m);
    const data = {
      timestamp: new Date(observedAt).toISOString(),
      station: `${station.name}-AWS`,
      station_id: stationId,
      source: 'Open-Meteo',
      stale: false,
      temperature: Number(current.temperature_2m),
      U10: windSpeed,
      wind_kmh: windSpeed * 3.6,
      humidity: Number(current.relative_humidity_2m),
      pressure_hpa: pressureNow,
      pressure_drop: pressureNow - pressureThreeHoursAgo,
      visibility_km: Number(hourly.visibility?.[currentHourIndex]) / 1000,
      wind_forecast: [...dailyWind.entries()].slice(0, 7).map(([day, samples]) => ({
        day: new Date(`${day}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }),
        wind: samples.reduce((sum, value) => sum + value, 0) / samples.length,
      })),
    };

    weatherCache.set(stationId, { data, fetched_at: Date.now() });
    res.json(data);
  } catch (error) {
    const cached = weatherCache.get(stationId);
    if (cached && Date.now() - cached.fetched_at < 60 * 60 * 1000) {
      return res.json({ ...cached.data, stale: true, stale_age_minutes: Math.floor((Date.now() - cached.fetched_at) / 60000) });
    }
    res.status(502).json({ error: 'Live weather unavailable', source: 'Open-Meteo', detail: error.message });
  }
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
const manifestStoreFile = path.join(__dirname, 'data', 'manifests.json');
let manifestWriteQueue = Promise.resolve();
const manifestStoreReady = fs.readFile(manifestStoreFile, 'utf8')
  .then(contents => {
    const records = JSON.parse(contents);
    if (Array.isArray(records)) records.forEach(manifest => { manifestsMemory[manifest.manifest_id] = manifest; });
  })
  .catch(error => {
    if (error.code !== 'ENOENT') console.error('Unable to load manifest file:', error.message);
  });

async function persistManifests() {
  await manifestStoreReady;
  const write = manifestWriteQueue.then(async () => {
    await fs.mkdir(path.dirname(manifestStoreFile), { recursive: true });
    const temporaryFile = `${manifestStoreFile}.tmp`;
    await fs.writeFile(temporaryFile, JSON.stringify(Object.values(manifestsMemory), null, 2));
    await fs.rename(temporaryFile, manifestStoreFile);
  });
  manifestWriteQueue = write.catch(() => {});
  await write;
}

async function findManifest(id) {
  await manifestStoreReady;
  if (mongoReady) { try { const doc = await Manifest.findOne({ manifest_id: id }); if (doc) return doc; } catch (_) {} }
  return manifestsMemory[id] || null;
}
async function saveManifest(manifest) {
  await manifestStoreReady;
  let storedManifest = manifest;
  if (mongoReady && typeof manifest.save === 'function') {
    try {
      await manifest.save();
      storedManifest = manifest.toObject();
    } catch (_) {}
  }
  manifestsMemory[storedManifest.manifest_id] = storedManifest;
  await persistManifests();
}

app.post('/api/v1/cargo/manifest', async (req, res) => {
  const { manifest_id, items, destination, vessel, vessel_mmsi } = req.body;
  if (!manifest_id || !Array.isArray(items) || items.length === 0 || !destination || !vessel) {
    return res.status(400).json({ error: 'manifest_id, destination, vessel, and cargo items are required' });
  }
  await manifestStoreReady;
  const existing = await findManifest(manifest_id);
  if (existing) return res.status(409).json({ error: 'Manifest already exists' });
  const data = { manifest_id, destination, vessel, status: 'Draft', items, vessel_mmsi: vessel_mmsi || null, crypto_hash: null, sealed_at: null, sealed_payload_json: null, tamper_detected: false, tamper_alerts: [], created_at: new Date(), updated_at: new Date() };
  if (mongoReady) {
    try {
      const saved = await new Manifest(data).save();
      manifestsMemory[manifest_id] = saved.toObject();
      await persistManifests();
      return res.status(201).json({ success: true, manifest: saved });
    } catch (_) {}
  }
  manifestsMemory[manifest_id] = data;
  try { await persistManifests(); } catch (error) { return res.status(503).json({ error: 'Unable to persist manifest', detail: error.message }); }
  res.status(201).json({ success: true, manifest: data });
});

app.post('/api/v1/cargo/manifest/:id/seal', async (req, res) => {
  const manifest = await findManifest(req.params.id);
  if (!manifest) return res.status(404).json({ error: 'Manifest not found' });
  if (manifest.crypto_hash) return res.status(409).json({ error: 'Already sealed' });
  const payloadObj = { manifest_id: manifest.manifest_id, destination: manifest.destination, vessel: manifest.vessel, items: manifest.items, vessel_mmsi: manifest.vessel_mmsi };
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
  const { manifest_id, items, destination, vessel, vessel_mmsi } = req.body;
  if (!manifest_id || !items) return res.status(400).json({ error: 'manifest_id and items required' });
  const manifest = await findManifest(manifest_id);
  if (!manifest) return res.status(404).json({ error: 'Not found' });
  if (!manifest.crypto_hash) return res.status(400).json({ error: 'Never sealed' });
  const incomingPayload = {
    manifest_id,
    destination: destination || manifest.destination,
    vessel: vessel || manifest.vessel,
    items,
    vessel_mmsi: vessel_mmsi || manifest.vessel_mmsi,
  };
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

app.post('/api/v1/cargo/verify-hash', async (req, res) => {
  const manifestId = String(req.body.manifest_id || '').trim();
  const scannedHash = String(req.body.scanned_hash || '').trim().toLowerCase();
  if (!manifestId || !/^[a-f0-9]{64}$/.test(scannedHash)) {
    return res.status(400).json({ error: 'manifest_id and a 64-character SHA-256 hash are required' });
  }
  const manifest = await findManifest(manifestId);
  if (!manifest) return res.status(404).json({ error: 'Manifest not found' });
  if (!manifest.crypto_hash) return res.status(409).json({ error: 'Manifest has not been sealed' });

  const matches = scannedHash === String(manifest.crypto_hash).toLowerCase();
  if (!matches) {
    manifest.tamper_detected = true;
    manifest.tamper_alerts = [...(manifest.tamper_alerts || []), {
      detected_at: new Date(),
      scanned_hash: scannedHash,
      stored_hash: manifest.crypto_hash,
      method: 'manual_hash_comparison',
    }];
    manifest.updated_at = new Date();
    await saveManifest(manifest);
  }

  res.json({
    manifest_id: manifest.manifest_id,
    matches,
    result: matches ? 'MATCH' : 'MISMATCH',
    expected_hash: manifest.crypto_hash,
    scanned_hash: scannedHash,
    checked_at: new Date().toISOString(),
    method: 'manual_hash_comparison',
    note: 'A hash match verifies the pasted value against the sealed reference; it does not inspect physical cargo contents.',
  });
});

app.get('/api/v1/cargo/manifests/latest', async (req, res) => {
  await manifestStoreReady;
  const recordsById = new Map(Object.values(manifestsMemory).map(manifest => [manifest.manifest_id, manifest]));
  if (mongoReady) {
    try {
      const databaseRecords = await Manifest.find({ crypto_hash: { $ne: null } }).sort({ sealed_at: -1 }).lean();
      databaseRecords.forEach(manifest => recordsById.set(manifest.manifest_id, manifest));
    } catch (_) {}
  }
  const latest = [...recordsById.values()]
    .filter(manifest => manifest.crypto_hash)
    .sort((left, right) => new Date(right.sealed_at) - new Date(left.sealed_at))[0];
  if (!latest) return res.status(404).json({ error: 'No sealed manifest found' });
  res.json(latest);
});

app.get('/api/v1/cargo/manifest/:id', async (req, res) => {
  const m = await findManifest(req.params.id);
  if (!m) return res.status(404).json({ error: 'Not found' });
  res.json(m);
});
app.get('/api/v1/cargo/manifests', async (req, res) => {
  await manifestStoreReady;
  const recordsById = new Map(Object.values(manifestsMemory).map(manifest => [manifest.manifest_id, manifest]));
  if (mongoReady) {
    try {
      const databaseRecords = await Manifest.find({}).lean();
      databaseRecords.forEach(manifest => recordsById.set(manifest.manifest_id, manifest));
    } catch (_) {}
  }
  res.json([...recordsById.values()]);
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

app.get('/api/v1/requisitions', async (req, res) => {
  await requisitionStoreReady;
  const recordsById = new Map(requisitionsMemory.map(record => [record.requisition_id, record]));
  if (mongoReady) {
    try {
      const databaseRecords = await Requisition.find({}).lean();
      databaseRecords.forEach(record => recordsById.set(record.requisition_id, record));
    } catch (_) {}
  }
  const station = req.query.station ? String(req.query.station).toLowerCase() : null;
  const records = [...recordsById.values()]
    .filter(record => !station || String(record.station).toLowerCase() === station)
    .sort((left, right) => new Date(right.created_at) - new Date(left.created_at));
  res.json(records);
});

app.post('/api/v1/requisitions', async (req, res) => {
  const station = String(req.body.station || '').trim().toLowerCase();
  const item = String(req.body.item || '').trim();
  const quantity = Number(req.body.quantity);
  const urgency = req.body.urgency || 'ROUTINE';
  if (!station || !item || !Number.isFinite(quantity) || quantity <= 0 || !['ROUTINE', 'CRITICAL'].includes(urgency)) {
    return res.status(400).json({ error: 'station, item, positive quantity, and valid urgency are required' });
  }

  const now = new Date();
  const record = {
    requisition_id: `REQ-${crypto.randomUUID()}`,
    station,
    item,
    quantity,
    unit: String(req.body.unit || 'Units'),
    urgency,
    status: 'PENDING_APPROVAL',
    decided_by: null,
    created_at: now,
    updated_at: now,
  };

  if (mongoReady) {
    try {
      await Requisition.create(record);
    } catch (_) {}
  }
  await requisitionStoreReady;
  requisitionsMemory.push(record);
  try {
    await persistRequisitions();
  } catch (error) {
    return res.status(503).json({ error: 'Unable to persist requisition', detail: error.message });
  }
  res.status(201).json({ success: true, requisition: record });
});

app.patch('/api/v1/requisitions/:id', async (req, res) => {
  const decision = String(req.body.decision || '').toUpperCase();
  if (!['APPROVED', 'DENIED'].includes(decision)) return res.status(400).json({ error: 'decision must be APPROVED or DENIED' });
  await requisitionStoreReady;
  const memoryRecord = requisitionsMemory.find(record => record.requisition_id === req.params.id);
  let databaseRecord = null;
  if (mongoReady) {
    try { databaseRecord = await Requisition.findOne({ requisition_id: req.params.id }); } catch (_) {}
  }
  const record = memoryRecord || databaseRecord?.toObject();
  if (!record) return res.status(404).json({ error: 'Requisition not found' });
  if (record.status !== 'PENDING_APPROVAL') return res.status(409).json({ error: 'Requisition is already decided' });

  const updatedAt = new Date();
  Object.assign(record, { status: decision, decided_by: String(req.body.decided_by || 'admin'), updated_at: updatedAt });
  if (databaseRecord) {
    Object.assign(databaseRecord, { status: decision, decided_by: record.decided_by, updated_at: updatedAt });
    try { await databaseRecord.save(); } catch (_) {}
  }
  if (!memoryRecord) requisitionsMemory.push(record);
  try {
    await persistRequisitions();
  } catch (error) {
    return res.status(503).json({ error: 'Unable to persist requisition decision', detail: error.message });
  }
  res.json({ success: true, requisition: record });
});

app.post('/api/v1/inventory/movements', async (req, res) => {
  const {
    station, item_id, name, category, unit, quantity_delta, stock_after,
    critical_threshold, lead_time_days, unit_cost, client_event_id, recorded_at, movement_type,
  } = req.body;
  const delta = Number(quantity_delta);
  const stock = Number(stock_after);
  if (!station || !item_id || !name || !client_event_id || !Number.isFinite(delta) || !Number.isFinite(stock) || stock < 0) {
    return res.status(400).json({ error: 'station, item_id, name, client_event_id, quantity_delta, and a non-negative stock_after are required' });
  }

  const optionalNumber = value => value === undefined || value === null || value === '' ? undefined : Number(value);
  const threshold = optionalNumber(critical_threshold);
  const leadTime = optionalNumber(lead_time_days);
  const unitCost = optionalNumber(unit_cost);
  if ([threshold, leadTime, unitCost].some(value => value !== undefined && (!Number.isFinite(value) || value < 0))) {
    return res.status(400).json({ error: 'threshold, lead_time_days, and unit_cost must be non-negative numbers' });
  }
  const recordedAt = recorded_at ? new Date(recorded_at) : new Date();
  if (Number.isNaN(recordedAt.getTime())) return res.status(400).json({ error: 'recorded_at must be a valid timestamp' });
  const movementType = movement_type || (delta === 0 ? 'snapshot' : delta < 0 ? 'consumption' : 'restock');
  const validMovementTypes = ['snapshot', 'consumption', 'restock', 'adjustment', 'disposal'];
  if (!validMovementTypes.includes(movementType)) return res.status(400).json({ error: 'Invalid movement_type' });

  const movement = {
    client_event_id: String(client_event_id),
    station: String(station).trim(),
    item_id: String(item_id),
    name: String(name).trim(),
    category,
    unit,
    quantity_delta: delta,
    stock_after: stock,
    critical_threshold: threshold,
    lead_time_days: leadTime,
    unit_cost: unitCost,
    movement_type: movementType,
    event_type: delta === 0 ? 'snapshot' : 'adjustment',
    recorded_at: recordedAt,
  };

  try {
    const result = await saveInventoryMovement(movement);
    return res.status(result.duplicate ? 200 : 201).json({ success: true, ...result });
  } catch (error) {
    return res.status(503).json({ error: 'Unable to persist inventory movement', detail: error.message });
  }
});

app.get('/api/v1/inventory/forecast', async (req, res) => {
  const station = req.query.station ? String(req.query.station) : null;
  await inventoryMovementStoreReady;
  let databaseMovements = [];
  if (mongoReady) {
    try {
      databaseMovements = await InventoryMovement.find(station ? { station } : {}).sort({ recorded_at: 1 }).lean();
    } catch (_) {}
  }
  const movementById = new Map(databaseMovements.map(movement => [movement.client_event_id, movement]));
  inventoryMovementsMemory.forEach(movement => movementById.set(movement.client_event_id, movement));
  const movements = [...movementById.values()]
    .filter(movement => !station || movement.station === station)
    .sort((a, b) => new Date(a.recorded_at) - new Date(b.recorded_at));

  const now = Date.now();
  const lookbackStart = now - 90 * 24 * 60 * 60 * 1000;
  const grouped = new Map();
  for (const movement of movements) {
    const key = `${movement.station}\0${movement.item_id}`;
    let group = grouped.get(key);
    if (!group) {
      group = { station: movement.station, item_id: movement.item_id, latest: movement, consumption: [] };
      grouped.set(key, group);
    }
    group.latest = movement;
    const recordedAt = new Date(movement.recorded_at).getTime();
    if (movement.movement_type === 'consumption' && movement.quantity_delta < 0 && recordedAt >= lookbackStart) {
      group.consumption.push(movement);
    }
  }

  const items = [...grouped.values()].map(group => {
    const latest = group.latest;
    const firstUsage = group.consumption[0];
    const lastUsage = group.consumption[group.consumption.length - 1];
    const historyDays = firstUsage && lastUsage
      ? Math.max(0, (new Date(lastUsage.recorded_at).getTime() - new Date(firstUsage.recorded_at).getTime()) / 86400000)
      : 0;
    const enoughHistory = group.consumption.length >= 2 && historyDays >= 7;
    const consumed = group.consumption.reduce((total, movement) => total - movement.quantity_delta, 0);
    const dailyRate = enoughHistory ? consumed / Math.max(historyDays, 1) : null;
    const stock = Number(latest.stock_after);
    const threshold = latest.critical_threshold ?? null;
    const daysToThreshold = dailyRate !== null && threshold !== null
      ? Math.max(0, (stock - threshold) / dailyRate)
      : null;
    const daysToStockout = dailyRate !== null && dailyRate > 0 ? stock / dailyRate : null;

    let status = 'collecting_history';
    if (threshold === null) status = 'threshold_not_configured';
    else if (stock <= threshold) status = 'reorder_now';
    else if (enoughHistory) status = 'trend_available';

    return {
      station: group.station,
      item_id: group.item_id,
      name: latest.name,
      category: latest.category,
      unit: latest.unit,
      current_stock: stock,
      critical_threshold: threshold,
      usage_event_count: group.consumption.length,
      history_days: Math.floor(historyDays),
      average_daily_consumption: dailyRate,
      days_until_threshold: daysToThreshold,
      days_until_stockout: daysToStockout,
      lead_time_days: latest.lead_time_days ?? null,
      unit_cost: latest.unit_cost ?? null,
      status,
    };
  }).sort((a, b) => {
    const rank = { reorder_now: 0, threshold_not_configured: 1, collecting_history: 2, trend_available: 3 };
    return rank[a.status] - rank[b.status] || (a.days_until_threshold ?? Infinity) - (b.days_until_threshold ?? Infinity);
  });

  res.json({ method: 'stock-threshold-and-consumption-baseline', trained_model: false, items });
});

// ─────────────────────────────────────────────────────────────────────────────
server.listen(PORT, () => console.log(`F.R.O.S.T Node server running on port ${PORT}`));
