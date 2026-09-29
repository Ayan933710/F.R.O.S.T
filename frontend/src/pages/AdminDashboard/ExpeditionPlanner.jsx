import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
 PieChart,
 Pie,
 Cell,
 Tooltip,
 ResponsiveContainer,
} from 'recharts';
import {
 BrainCircuit,
 Lock,
 PlaneTakeoff,
 ShieldCheck,
 Cpu,
 Plane,
 Calendar,
 IndianRupee,
 Users,
 Loader,
 Wind,
 Compass,
 CheckCircle,
 Radio,
 GripVertical,
 Check,
 Plus,
 Pencil,
 Trash2,
 X,
 AlertTriangle,
 Minus,
} from 'lucide-react';
import { useIceNet } from '../../context/IceNetContext';
import InventoryDemandPanel from './InventoryDemandPanel';

const defaultFlights = [
 { id: 'CHF-301', route: 'Cape Town → Maitri', date: '2026-10-05', duration: 8, offset: 0, status: 'Confirmed', window: 'Oct 1 - Oct 8' },
 { id: 'CHF-302', route: 'Christchurch → Bharati', date: '2026-10-12', duration: 12, offset: 3, status: 'Pending', window: 'Oct 4 - Oct 16' },
 { id: 'CHF-303', route: 'Tromsø → Himadri', date: '2026-10-18', duration: 5, offset: 6, status: 'Confirmed', window: 'Oct 7 - Oct 12' },
];

const getFlightStatusColor = (status) => {
 if (status === 'Confirmed') return 'var(--ok)';
 if (status === 'Delayed' || status === 'Cancelled') return 'var(--critical)';
 if (status === 'Planned') return 'var(--text-secondary)';
 return 'var(--accent-primary)';
};

const initialSummerTeam = [
 { id: 's1', name: 'Dr. Elena Vasquez', role: 'Lead Glaciologist' },
 { id: 's2', name: 'Eng. Kofi Mensah', role: 'Power Systems' },
 { id: 's3', name: 'Dr. Aanya Sharma', role: 'Marine Biologist' },
 { id: 's4', name: 'Tech. Liam Chen', role: 'Comms Specialist' },
];

const initialWinterTeam = [
 { id: 'w1', name: 'Sgt. Nora Lindqvist', role: 'Field Medic & Ops Lead' },
 { id: 'w2', name: 'Dr. Raj Patel', role: 'Atmospheric Physicist' },
 { id: 'w3', name: 'Eng. Yuki Tanaka', role: 'Mechanical Engineer' },
];

const defaultBudgetData = [
 { name: 'Charter Flights', value: 4.2, color: '#3B82F6' },
 { name: 'Cold Logistics', value: 1.8, color: '#F43F5E' },
 { name: 'Reserve', value: 2.1, color: '#4ade80' },
];

const CustomPieTooltip = ({ active, payload, total }) => {
 if (active && payload && payload.length) {
  const data = payload[0];
  return (
   <div className="bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] p-2.5 rounded-lg shadow-xl font-['Work_Sans'] text-xs">
    <p className="font-semibold text-[var(--text-primary)]">{data.name}</p>
    <p className="text-[var(--accent-primary)] font-mono font-bold mt-0.5">
    ₹{Number(data.value).toFixed(1)} Cr ({(total > 0 ? (data.value / total) * 100 : 0).toFixed(1)}%)
    </p>
   </div>
  );
 }
 return null;
};

export default function ExpeditionPlanner() {
 const { sealedManifestHash, setSealedManifestHash } = useIceNet();
 const [flights, setFlights] = useState(defaultFlights);
 const [budgetData, setBudgetData] = useState(defaultBudgetData);
 const [flightDraft, setFlightDraft] = useState([]);
 const [budgetDraft, setBudgetDraft] = useState([]);
 const [isScheduleEditing, setIsScheduleEditing] = useState(false);
 const [isBudgetEditing, setIsBudgetEditing] = useState(false);
 const [isPlannerSaving, setIsPlannerSaving] = useState(false);
 const [plannerNotice, setPlannerNotice] = useState('');

 useEffect(() => {
  let cancelled = false;
    fetch('http://localhost:5000/api/v1/expeditions/ISEA-46')
     .then(response => {
       if (!response.ok) throw new Error(`Could not load expedition plan (${response.status})`);
    return response.json();
   })
   .then(expedition => {
     if (cancelled) return;
     if (Array.isArray(expedition.charter_schedule)) setFlights(expedition.charter_schedule);
     if (Array.isArray(expedition.budget_allocation)) setBudgetData(expedition.budget_allocation);
   })
   .catch(error => {
    if (!cancelled) setPlannerNotice(error.message);
   });

  return () => { cancelled = true; };
 }, []);

 const savePlannerFields = async (fields) => {
  setIsPlannerSaving(true);
  setPlannerNotice('');
  try {
   const response = await fetch('http://localhost:5000/api/v1/expeditions/ISEA-46', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fields),
   });
   const result = await response.json();
   if (!response.ok) throw new Error(result.error || `Save failed (${response.status})`);
   setPlannerNotice('Planner changes saved.');
   return result.expedition;
  } catch (error) {
   setPlannerNotice(error.message || 'Could not save planner changes.');
   return null;
  } finally {
   setIsPlannerSaving(false);
  }
 };

 const updateFlightDraft = (flightId, field, value) => {
  setFlightDraft(current => current.map(flight => {
   const updated = { ...flight, [field]: field === 'duration' ? Number(value) : value };
   if (field === 'date' && value) {
    const start = new Date('2026-10-01T00:00:00');
    const scheduled = new Date(`${value}T00:00:00`);
    updated.offset = Math.max(0, Math.min(25, Math.round((scheduled - start) / 86400000)));
   }
   return flight.id === flightId ? updated : flight;
  }));
 };

 const addFlightDraft = () => {
  setFlightDraft(current => {
   const nextId = current.reduce((maxId, flight) => {
    const number = Number(flight.id.match(/\d+$/)?.[0] || 0);
    return Math.max(maxId, number);
   }, 300) + 1;
   return [...current, {
    id: `CHF-${nextId}`,
    route: '',
    date: '2026-10-01',
    duration: 1,
    offset: 0,
    status: 'Planned',
    window: 'To be scheduled',
   }];
  });
 };

 const ganttDays = Math.max(25, ...flights.map(flight => Math.max(0, Number(flight.offset) || 0) + Math.max(1, Number(flight.duration) || 1)));
 const ganttStart = new Date('2026-10-01T00:00:00');
 const ganttTicks = Array.from({ length: 6 }, (_, index) => {
  const date = new Date(ganttStart.getTime() + (ganttDays * index / 5) * 86400000);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
 });

 const handleAutomateBudget = () => {
  setIsBudgetEditing(true);
  setBudgetDraft([
   { name: 'Charter Flights', value: 5.5, color: '#3B82F6' },
   { name: 'Cold Logistics', value: 2.8, color: '#F43F5E' },
   { name: 'Asset Demand Reserve', value: 3.5, color: '#eab308' },
   { name: 'Reserve', value: 2.0, color: '#4ade80' },
  ]);
 };

 const displayedBudgetData = isBudgetEditing ? budgetDraft : budgetData;
 const budgetTotal = displayedBudgetData.reduce((total, entry) => total + Number(entry.value || 0), 0);
 const reserveAmount = displayedBudgetData.find(entry => entry.name.toLowerCase() === 'reserve')?.value || 0;

 // ML Prediction state
 const [isPredicting, setIsPredicting] = useState(false);
 const [predictionResult, setPredictionResult] = useState(null);
 const [predictionError, setPredictionError] = useState('');
 const [weatherStation, setWeatherStation] = useState('maitri');

 // Cryptographic Sealing state
 const [isSealing, setIsSealing] = useState(false);
 const [sealedManifests, setSealedManifests] = useState(
  sealedManifestHash ? [{
   hash: sealedManifestHash,
   destination: 'Bharati Station, Antarctica',
   vessel: 'LC-130 Hercules',
   items: [
    { name: 'Modular Generators', qty: 2, unit: 'Units' },
    { name: 'Food Supplies', qty: 1.5, unit: 'T' },
    { name: 'Scientific Equip. Crates', qty: 4, unit: 'Crates' },
    { name: 'Ice Core Drill', qty: 1, unit: 'Units' }
   ],
   timestamp: new Date().toLocaleString(),
   sealedBy: 'AdminHQ'
  }] : []
 );
 const [isSealModalOpen, setIsSealModalOpen] = useState(false);
 const [sealStep, setSealStep] = useState('CREATE'); // 'CREATE' | 'REVIEW'
 const [draftManifest, setDraftManifest] = useState({
  destination: 'Bharati',
  vessel: 'LC-130 Hercules',
  items: [
   { name: 'Medical Kits (Trauma)', qty: 5, unit: 'Units', isCustom: false }
  ]
 });
 const availableVessels = ['Icebreaker SA Agulhas', 'LC-130 Hercules', 'Ilyushin IL-76', 'C-17 Globemaster'];

 const standardInventory = [
  { name: 'Aviation Turbine Fuel (ATF)', unit: 'Liters' },
  { name: 'High Speed Diesel (HSD)', unit: 'Liters' },
  { name: 'Medical Kits (Trauma)', unit: 'Units' },
  { name: 'Medical Kits (Routine)', unit: 'Units' },
  { name: 'Seismic Sensors', unit: 'Units' },
  { name: 'Rations (MRE)', unit: 'Boxes' },
  { name: 'Fresh Produce', unit: 'Kg' },
  { name: 'Modular Generators', unit: 'Units' },
  { name: 'Scientific Equip. Crates', unit: 'Crates' },
  { name: 'Ice Core Drill', unit: 'Units' },
 ];

 // Drag-and-drop interactive roster states
 const [summerRoster, setSummerRoster] = useState(initialSummerTeam);
 const [winterRoster, setWinterRoster] = useState(initialWinterTeam);
 
 // Add Roster Personnel State
 const [isAddRosterOpen, setIsAddRosterOpen] = useState(false);
 const [newPerson, setNewPerson] = useState({ name: '', role: '', timeline: 'summer' });

 const handleAddPerson = (e) => {
  e.preventDefault();
  if (!newPerson.name || !newPerson.role) return;
  
  const newEntry = { id: Date.now().toString(), name: newPerson.name, role: newPerson.role };
  if (newPerson.timeline === 'summer') {
   setSummerRoster([...summerRoster, newEntry]);
  } else {
   setWinterRoster([...winterRoster, newEntry]);
  }
  setNewPerson({ name: '', role: '', timeline: 'summer' });
  setIsAddRosterOpen(false);
 };

 const handlePredictWindow = async () => {
  setIsPredicting(true);
  setPredictionResult(null);
  setPredictionError('');
  try {
   const weatherResponse = await fetch(`http://localhost:5000/api/v1/aws/current?station=${weatherStation}`);
   const weather = await weatherResponse.json();
   if (!weatherResponse.ok) throw new Error(weather.error || 'Live weather unavailable');

   const predictionUrl = new URL('http://localhost:5000/api/v1/ml/predict-window');
   Object.entries({
    U10: weather.U10,
    pressure_drop: weather.pressure_drop,
    temperature: weather.temperature,
    humidity: weather.humidity,
    timestamp: weather.timestamp,
    station: weather.station_id,
   }).forEach(([key, value]) => predictionUrl.searchParams.set(key, value));

   const predictionResponse = await fetch(predictionUrl);
   const prediction = await predictionResponse.json();
   if (!predictionResponse.ok || prediction.error) throw new Error(prediction.error || 'Weather model unavailable');

   setPredictionResult({
    safe: prediction.safe,
    probability: Math.round(Number(prediction.probability) * 100),
    temperature: weather.temperature,
    wind: weather.U10,
    visibilityKm: weather.visibility_km,
    observedAt: weather.timestamp,
    source: weather.source,
    stale: weather.stale,
   });
  } catch (error) {
   setPredictionError(error.message || 'Unable to fetch weather estimate.');
  } finally {
   setIsPredicting(false);
  }
 };

 const addEmptyItem = (e) => {
  e.preventDefault();
  setDraftManifest({ ...draftManifest, items: [...draftManifest.items, { name: '', qty: '', unit: '', isCustom: false }] });
 };
 const addCustomItem = (e) => {
  e.preventDefault();
  setDraftManifest({ ...draftManifest, items: [...draftManifest.items, { name: '', qty: '', unit: '', isCustom: true }] });
 };
 const updateItem = (idx, field, value) => {
  const newItems = [...draftManifest.items];
  newItems[idx][field] = value;
  setDraftManifest({ ...draftManifest, items: newItems });
 };
 const removeItem = (idx) => {
  setDraftManifest({ ...draftManifest, items: draftManifest.items.filter((_, i) => i !== idx) });
 };

 const handleConfirmSeal = async () => {
  setIsSealing(true);
  try {
   const manifest_id = `MAN-${Date.now()}`;
   const payload = {
    manifest_id,
    destination: draftManifest.destination + ' Station, Antarctica',
    vessel: draftManifest.vessel,
    items: draftManifest.items,
    vessel_mmsi: '123456789'
   };
   
   await fetch('http://localhost:5000/api/v1/cargo/manifest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
   });
   
   const sealRes = await fetch(`http://localhost:5000/api/v1/cargo/manifest/${manifest_id}/seal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
   });
   
   if (sealRes.ok) {
    const sealData = await sealRes.json();
    const hash = sealData.crypto_hash;
    const newManifest = {
     hash,
     destination: payload.destination,
     vessel: payload.vessel,
     items: [...payload.items],
     timestamp: new Date().toLocaleString(),
     sealedBy: 'AdminHQ'
    };
    
    setSealedManifests([newManifest, ...sealedManifests]);
    setSealedManifestHash(hash);
   }
  } catch (error) {
   console.error('Failed to seal manifest:', error);
  } finally {
   setIsSealing(false);
   setIsSealModalOpen(false);
   setSealStep('CREATE');
   setDraftManifest({ destination: 'Himadri', vessel: 'Icebreaker SA Agulhas', items: [{ name: 'Seismic Sensors', qty: 12, unit: 'Units' }] });
  }
 };

 return (
  <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-6 h-full flex flex-col overflow-hidden overflow-x-hidden w-full max-w-full">
   {/* Dashboard Header */}
   <div className="flex items-center justify-between mb-6 shrink-0 pb-4 border-b border-[var(--border)]">
        <div>
      <h2 className="text-[var(--accent-primary)] font-['Space_Grotesk'] font-bold text-2xl tracking-wide">
       EXPEDITION PLANNER · COMMAND DECK
      </h2>
      <p className="text-[var(--text-secondary)] text-xs font-['Work_Sans']">ISEA-46 · 2026–27</p>
        </div>

    <div className="flex items-center gap-3">
     <div className="flex items-center gap-2 bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] px-3.5 py-1.5 rounded-lg border border-[var(--border)] text-xs font-mono">
      <Radio size={14} className="text-[var(--ok)] animate-pulse" />
      <span className="text-[var(--text-secondary)]">Edge Mesh Sync:</span>
      <span className="text-[var(--ok)] font-semibold">Active</span>
     </div>
    </div>
   </div>

   {/* Main Scrollable Body */}
   <div className="flex-1 overflow-y-auto space-y-6 pr-1">
    {plannerNotice && (
     <p role="status" className="border-b border-[var(--border)] pb-3 text-xs text-[var(--text-secondary)]">
      {plannerNotice}
     </p>
    )}
    <InventoryDemandPanel />

    {/* ─── Top Row: Timeline & Interactive Budget ─── */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
     {/* Timeline Gantt */}
     <div className="lg:col-span-7 bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-between min-w-0">
      {/* Header & Status Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--border)]">
       <div>
         <h3 className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
          <Plane size={15} className="text-[var(--accent-primary)]" />
          Expedition Roster
        </h3>
        {/* Status Legend */}
        <div className="flex items-center gap-4 text-xs font-['Work_Sans'] mt-2">
         <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--ok)]" />
          <span className="text-[var(--text-secondary)]">Confirmed (planner-entered)</span>
         </div>
         <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
          <span className="text-[var(--text-secondary)]">Pending (planner-entered)</span>
         </div>
        </div>
       </div>

      <div className="flex items-center gap-2 self-start sm:self-center">
       {isScheduleEditing ? (
        <button
         type="button"
         onClick={addFlightDraft}
         className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[var(--accent-primary)] text-[var(--accent-primary)] text-[10px] font-semibold hover:bg-[var(--accent-primary)]/10"
        >
         <Plus size={12} /> Add charter
        </button>
       ) : (
        <button
         type="button"
         onClick={() => {
          setFlightDraft(flights.map(flight => ({ ...flight })));
          setIsScheduleEditing(true);
          setPlannerNotice('');
         }}
         className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[var(--border)] text-[var(--text-secondary)] text-[10px] font-semibold hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
        >
         <Pencil size={12} /> Edit schedule
        </button>
       )}
       <span className="text-[10px] text-[var(--ok)] bg-[var(--ok)]/10 px-2.5 py-1 rounded border border-[var(--ok)] font-semibold font-mono">
        {flights.length} Charters Scheduled
       </span>
      </div>
      </div>

      <div className="space-y-3.5 mb-2">
       <div className="flex items-center text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
        <div className="w-36 shrink-0 font-medium">Vessel / Route</div>
        <div className="flex-1 relative h-4 font-mono text-[10px]">
         {ganttTicks.map((d, i) => (
          <span
           key={d}
           className={`absolute whitespace-nowrap ${
            i === 0 ? 'left-0' : i === 5 ? 'right-0' : '-translate-x-1/2'
           }`}
           style={i > 0 && i < 5 ? { left: `${(i / 5) * 100}%` } : undefined}
          >
           {d}
          </span>
         ))}
        </div>
        <span className="w-16 shrink-0 text-right font-medium">Status</span>
       </div>

       {flights.map((f) => (
        <div key={f.id} className="flex items-center gap-3">
         <div className="w-36 shrink-0">
          <p className="font-bold text-[var(--text-primary)] text-sm tracking-wide">{f.id}</p>
          <p className="text-xs text-[var(--text-secondary)] truncate">{f.route}</p>
         </div>
         <div className="flex-1 relative h-7">
          {/* Background track with dashed vertical alignment lines */}
          <div className="absolute inset-0 bg-[var(--bg-primary)] rounded border border-[var(--border)] overflow-hidden">
           <div className="grid grid-cols-5 h-full">
            <div className="border-r border-dashed border-[var(--border)]/70 h-full" />
            <div className="border-r border-dashed border-[var(--border)]/70 h-full" />
            <div className="border-r border-dashed border-[var(--border)]/70 h-full" />
            <div className="border-r border-dashed border-[var(--border)]/70 h-full" />
            <div className="h-full" />
           </div>
          </div>

          {/* Flight Timeline Bar & Interactive Tooltip */}
          <div
           className="group absolute top-1 bottom-1 rounded transition-all duration-300 hover:brightness-110 cursor-pointer flex items-center px-2 z-10"
           style={{
            left: `${(Math.max(0, Number(f.offset) || 0) / ganttDays) * 100}%`,
            width: `${(Math.max(1, Number(f.duration) || 1) / ganttDays) * 100}%`,
            backgroundColor: getFlightStatusColor(f.status),
            opacity: 0.9,
           }}
          >
           <span className="text-[10px] font-mono font-bold text-white/90 truncate select-none">
            {f.id}
           </span>

           {/* Hover Tooltip */}
           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col z-30 pointer-events-none whitespace-nowrap bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-md py-1.5 px-3 shadow-2xl text-[11px] font-['Work_Sans']">
            <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-bold">
             <span>Flight: {f.id}</span>
             <span className="text-[var(--text-secondary)] font-normal">|</span>
             <span className="text-[var(--accent-primary)]">Route: {f.route}</span>
            </div>
            <div className="text-[10px] text-[var(--text-secondary)] font-mono mt-0.5 flex items-center gap-2">
             <span>Date: {f.date} · {f.duration} days</span>
             <span>|</span>
             <span
              className="font-semibold"
              style={{ color: getFlightStatusColor(f.status) }}
             >
              Status: {f.status}
             </span>
            </div>
           </div>
          </div>
         </div>
         <span
          className="w-16 text-right font-mono text-[10px] font-semibold"
          style={{ color: getFlightStatusColor(f.status) }}
         >
          {f.status}
         </span>
        </div>
       ))}
      </div>

      {isScheduleEditing && (
       <div className="mt-4 border-t border-[var(--border)] pt-4">
        <p className="mb-3 text-[10px] text-[var(--text-secondary)]">Status is manually set by the planner; it is not verified against weather, clearance, or dispatch systems.</p>
        <div className="grid grid-cols-[minmax(64px,0.7fr)_minmax(130px,2fr)_minmax(120px,1fr)_90px_120px_36px] gap-2 mb-2 text-[10px] text-[var(--text-secondary)] uppercase">
         <span>Charter</span><span>Route</span><span>Date</span><span>Days</span><span>Status</span><span />
        </div>
        <div className="space-y-2">
         {flightDraft.map(flight => (
          <div key={flight.id} className="grid grid-cols-[minmax(64px,0.7fr)_minmax(130px,2fr)_minmax(120px,1fr)_90px_120px_36px] gap-2 items-center">
           <span className="text-xs font-semibold text-[var(--text-primary)]">{flight.id}</span>
           <input
        aria-label={`${flight.id} route`}
        value={flight.route}
        onChange={event => updateFlightDraft(flight.id, 'route', event.target.value)}
        className="min-w-0 bg-[var(--bg-primary)] border border-[var(--border)] px-2 py-1.5 text-xs text-[var(--text-primary)]"
           />
           <input
        aria-label={`${flight.id} date`}
        type="date"
        value={flight.date}
        onChange={event => updateFlightDraft(flight.id, 'date', event.target.value)}
        className="min-w-0 bg-[var(--bg-primary)] border border-[var(--border)] px-2 py-1.5 text-xs text-[var(--text-primary)]"
           />
           <input
        aria-label={`${flight.id} duration in days`}
        type="number"
        min="1"
        max="25"
        value={flight.duration}
        onChange={event => updateFlightDraft(flight.id, 'duration', event.target.value)}
        className="min-w-0 bg-[var(--bg-primary)] border border-[var(--border)] px-2 py-1.5 text-xs text-[var(--text-primary)]"
           />
           <select
        aria-label={`${flight.id} status`}
        value={flight.status}
        onChange={event => updateFlightDraft(flight.id, 'status', event.target.value)}
        className="min-w-0 bg-[var(--bg-primary)] border border-[var(--border)] px-2 py-1.5 text-xs text-[var(--text-primary)]"
           >
          <option>Planned</option>
          <option>Pending</option>
          <option>Confirmed</option>
          <option>Delayed</option>
          <option>Cancelled</option>
           </select>
            <button
            type="button"
            aria-label={`Remove ${flight.id}`}
            title={`Remove ${flight.id}`}
            onClick={() => setFlightDraft(current => current.filter(entry => entry.id !== flight.id))}
            className="flex size-8 items-center justify-center border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--critical)] hover:text-[var(--critical)]"
            >
            <Trash2 size={14} />
            </button>
          </div>
         ))}
        </div>
        <div className="mt-3 flex justify-end gap-2">
         <button type="button" onClick={() => setIsScheduleEditing(false)} className="px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
         <button
          type="button"
          disabled={isPlannerSaving || new Set(flightDraft.map(flight => flight.id)).size !== flightDraft.length || flightDraft.some(flight => !flight.route.trim() || !flight.date || !Number.isFinite(flight.duration) || flight.duration < 1 || !['Planned', 'Pending', 'Confirmed', 'Delayed', 'Cancelled'].includes(flight.status))}
          onClick={async () => {
           const result = await savePlannerFields({ charter_schedule: flightDraft });
           if (result) {
        setFlights(result.charter_schedule || flightDraft);
        setIsScheduleEditing(false);
           }
          }}
          className="px-3 py-1.5 border border-[var(--accent-primary)] text-xs font-semibold text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 disabled:opacity-50"
         >
          {isPlannerSaving ? 'Saving...' : 'Save schedule'}
         </button>
        </div>
       </div>
      )}

      <div className="text-[10px] text-[var(--text-secondary)] pt-3 border-t border-[var(--border)] font-mono flex justify-between">
       <span>Primary Air Corridor: Cape Town ↔ Schirmacher Oasis</span>
       <span>Alternate: Christchurch (LC-130)</span>
      </div>
     </div>

     {/* Interactive INR Budget Donut */}
     <div className="lg:col-span-5 bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-between min-w-0">
      <div className="flex items-center justify-between mb-2">
       <h3 className="text-[var(--text-secondary)] text-xs uppercase tracking-widest font-semibold flex items-center gap-2">
        <IndianRupee size={15} className="text-[var(--accent-primary)]" />
        INR Budget Allocation (₹{budgetTotal.toFixed(1)} Cr Total)
       </h3>
             {isBudgetEditing ? (
        <div className="flex items-center gap-2">
         <button type="button" onClick={() => { setIsBudgetEditing(false); setBudgetDraft([]); }} className="px-2 py-1 text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Cancel</button>
         <button type="button" onClick={() => setBudgetDraft([...budgetDraft, { name: 'New Field', value: 0, color: '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0') }])} className="px-2 py-1 text-[10px] text-[var(--ok)] border border-[var(--ok)]/50 hover:bg-[var(--ok)]/10 rounded">
          <Plus size={10} className="inline mr-1"/> Add Field
         </button>
         <button
          type="button"
          disabled={isPlannerSaving || budgetDraft.some(entry => !entry.name.trim() || !Number.isFinite(Number(entry.value)) || Number(entry.value) < 0)}
          onClick={async () => {
           const allocations = budgetDraft.map(entry => ({ ...entry, value: Number(entry.value) }));
           const result = await savePlannerFields({ budget_allocation: allocations });
           if (result) {
            setBudgetData(result.budget_allocation || allocations);
            setIsBudgetEditing(false);
            setBudgetDraft([]);
           }
          }}
          className="px-2 py-1 border border-[var(--accent-primary)] text-[10px] font-semibold text-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/10 disabled:opacity-50 rounded"
         >
          {isPlannerSaving ? 'Saving...' : 'Save budget'}
         </button>
        </div>
             ) : (
        <div className="flex items-center gap-2">
         <button type="button" onClick={handleAutomateBudget} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[var(--accent-primary)] text-[var(--accent-primary)] text-[10px] font-semibold hover:bg-[var(--accent-primary)]/10 rounded">
          <BrainCircuit size={12} /> Automate Budget
         </button>
         <button
          type="button"
          onClick={() => { setBudgetDraft(budgetData.map(entry => ({ ...entry }))); setIsBudgetEditing(true); setPlannerNotice(''); }}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border border-[var(--border)] text-[var(--text-secondary)] text-[10px] font-semibold hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] rounded"
         >
          <Pencil size={12} /> Edit budget
         </button>
        </div>
             )}
      </div>

      <div className={`${isBudgetEditing ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-[minmax(0,1fr)_auto] gap-6'} items-center w-full my-auto min-w-0`}>
       {/* Donut Chart */}
       <div className="w-full flex items-center justify-center py-1 min-w-0">
        <div className="w-40 h-40 relative flex items-center justify-center shrink-0">
         <ResponsiveContainer width="100%" height="100%">
          <PieChart>
           <Tooltip content={<CustomPieTooltip total={budgetTotal} />} />
           <Pie
            data={displayedBudgetData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={38}
            outerRadius={55}
            stroke="none"
            paddingAngle={3}
           >
            {displayedBudgetData.map((entry) => (
             <Cell key={entry.name} fill={entry.color} />
            ))}
           </Pie>
          </PieChart>
         </ResponsiveContainer>
         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider">Total</span>
          <span className="w-full px-1 text-center whitespace-nowrap font-['Space_Grotesk'] font-bold text-sm text-[var(--accent-primary)] leading-none mt-0.5">₹{budgetTotal.toFixed(1)} Cr</span>
         </div>
        </div>
       </div>

       {/* Dense Flex Legend */}
      <div className={`flex flex-col gap-2.5 font-['Work_Sans'] w-full min-w-0 ${isBudgetEditing ? 'max-h-56' : 'max-h-48'} overflow-y-auto pr-1`}>
        {displayedBudgetData.map((b, index) => (
         <div
          key={isBudgetEditing ? index : b.name}
          className="flex items-center justify-between bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 w-full gap-6"
         >
          <div className="flex items-center gap-2 min-w-0">
           <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: b.color }}
           />
           {isBudgetEditing ? (
            <input
             aria-label={`Budget category ${index + 1}`}
             value={budgetDraft[index]?.name ?? ''}
             onChange={event => setBudgetDraft(current => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, name: event.target.value } : entry))}
             className="w-32 min-w-0 bg-[var(--bg-panel-raised)] border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-primary)]"
            />
           ) : (
            <span className="text-[var(--text-primary)] text-sm font-medium whitespace-nowrap">{b.name}</span>
           )}
          </div>
          {isBudgetEditing ? (
           <div className="flex items-center gap-2">
            <label className="flex items-center gap-1 whitespace-nowrap text-xs text-[var(--text-secondary)]">
             ₹<input
              aria-label={`${b.name} budget in crore INR`}
              type="number"
              min="0"
              step="0.1"
              value={budgetDraft[index]?.value ?? ''}
              onChange={event => setBudgetDraft(current => current.map((entry, entryIndex) => entryIndex === index ? { ...entry, value: event.target.value === '' ? '' : Number(event.target.value) } : entry))}
              className="w-20 bg-[var(--bg-panel-raised)] border border-[var(--border)] px-2 py-1 text-xs text-[var(--text-primary)]"
             /> Cr
            </label>
            <button type="button" onClick={() => setBudgetDraft(current => current.filter((_, i) => i !== index))} className="text-[var(--critical)] hover:text-white p-1">
             <X size={14} />
            </button>
           </div>
          ) : (
           <span className="whitespace-nowrap font-mono text-sm font-bold text-[var(--text-primary)]">₹{Number(b.value).toFixed(1)} Cr</span>
          )}
         </div>
        ))}
       </div>
      </div>

      <div className="text-[10px] text-[var(--text-secondary)] pt-2 border-t border-[var(--border)] font-mono flex justify-between">
       <span>Financial Authority: MoES/NCPOR</span>
      <span className="text-[var(--ok)]">Reserve: ₹{Number(reserveAmount).toFixed(1)} Cr ({(budgetTotal > 0 ? (reserveAmount / budgetTotal) * 100 : 0).toFixed(0)}%)</span>
      </div>
     </div>
    </div>

    {/* ─── Middle Row: Drag-and-Drop Roster Planning ─── */}
    <div className="bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-5">
     <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
      <div>
       <h3 className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-widest flex items-center gap-2 mb-1">
        <Users size={15} className="text-[var(--accent-primary)]" />
        EXPEDITION ROSTER
       </h3>
      </div>
      <button 
       onClick={() => setIsAddRosterOpen(true)}
       className="px-4 py-2 text-xs font-bold bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all flex items-center gap-2 shadow-sm"
      >
       <Plus size={14} /> Add Personnel
      </button>
     </div>

     <AnimatePresence>
      {isAddRosterOpen && (
       <motion.form 
         initial={{ height: 0, opacity: 0 }} 
         animate={{ height: 'auto', opacity: 1 }} 
         exit={{ height: 0, opacity: 0 }}
         className="mb-6 p-4 bg-[var(--bg-panel)] border border-[var(--border)] rounded-xl flex flex-col lg:flex-row items-end gap-4 overflow-hidden"
         onSubmit={handleAddPerson}
       >
         <div className="flex-1 w-full">
           <label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1.5 block tracking-widest">Full Name</label>
           <input required type="text" value={newPerson.name} onChange={e => setNewPerson({...newPerson, name: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors shadow-inner" placeholder="e.g. Dr. Jane Smith" />
         </div>
         <div className="flex-1 w-full">
           <label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1.5 block tracking-widest">Specialized Role</label>
           <input required type="text" value={newPerson.role} onChange={e => setNewPerson({...newPerson, role: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors shadow-inner" placeholder="e.g. Lead Seismologist" />
         </div>
         <div className="w-full lg:w-56">
           <label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1.5 block tracking-widest">Timeline Assignment</label>
           <select value={newPerson.timeline} onChange={e => setNewPerson({...newPerson, timeline: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer transition-colors shadow-inner">
             <option value="summer">Summer Operational</option>
             <option value="winter">Winter-Over Isolation</option>
           </select>
         </div>
         <div className="flex items-center gap-2 w-full lg:w-auto">
           <button type="submit" className="flex-1 lg:flex-none px-6 py-2.5 bg-[var(--accent-primary)] text-white text-xs font-bold rounded-lg border border-blue-400/30 hover:bg-blue-600 transition-colors shadow-[var(--shadow-glass)]">
             Add to Roster
           </button>
           <button type="button" onClick={() => setIsAddRosterOpen(false)} className="px-3 py-2.5 bg-[var(--bg-primary)] text-[var(--text-secondary)] text-xs font-bold rounded-lg border border-[var(--border)] hover:text-[var(--critical)] hover:border-[var(--critical)]/50 hover:bg-[var(--critical)]/10 transition-colors">
             <X size={14} />
           </button>
         </div>
       </motion.form>
      )}
     </AnimatePresence>

     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Summer Team Reorder */}
      <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-4 flex flex-col">
       <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border)]">
        <span className="text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
         <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] inline-block"></span>
         Summer Operational Team
        </span>
        <span className="text-[var(--text-secondary)] text-[11px] font-mono">
         {summerRoster.length} Personnel Assigned
        </span>
       </div>

       <Reorder.Group
        axis="y"
        values={summerRoster}
        onReorder={setSummerRoster}
        className="space-y-1 select-none"
       >
        {summerRoster.map((m) => (
         <Reorder.Item
          key={m.id}
          value={m}
          whileHover={{ scale: 1.02 }}
          whileDrag={{
           scale: 1.05,
           boxShadow: '0px 10px 20px rgba(0,0,0,0.5)',
           zIndex: 50,
           cursor: 'grabbing',
          }}
          className="cursor-grab active:cursor-grabbing"
         >
          <div className="flex items-center justify-between w-full p-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded mb-2">
           <div className="flex items-center gap-2 min-w-0 pr-2">
            <GripVertical size={14} className="text-[var(--text-secondary)] shrink-0 opacity-50" />
            <span className="text-sm font-bold text-[var(--text-primary)] truncate">
             {m.name}
            </span>
           </div>
           <span className="text-xs text-[var(--text-secondary)] truncate text-right">
            {m.role}
           </span>
          </div>
         </Reorder.Item>
        ))}
       </Reorder.Group>
      </div>

      {/* Winter-Over Team Reorder */}
      <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-4 flex flex-col">
       <div className="flex items-center justify-between mb-3 pb-2 border-b border-[var(--border)]">
        <span className="text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
         <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] inline-block"></span>
         Winter-Over Isolation Team
        </span>
        <span className="text-[var(--text-secondary)] text-[11px] font-mono">
         {winterRoster.length} Personnel Assigned
        </span>
       </div>

       <Reorder.Group
        axis="y"
        values={winterRoster}
        onReorder={setWinterRoster}
        className="space-y-1 select-none"
       >
        {winterRoster.map((m) => (
         <Reorder.Item
          key={m.id}
          value={m}
          whileHover={{ scale: 1.02 }}
          whileDrag={{
           scale: 1.05,
           boxShadow: '0px 10px 20px rgba(0,0,0,0.5)',
           zIndex: 50,
           cursor: 'grabbing',
          }}
          className="cursor-grab active:cursor-grabbing"
         >
          <div className="flex items-center justify-between w-full p-2.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded mb-2">
           <div className="flex items-center gap-2 min-w-0 pr-2">
            <GripVertical size={14} className="text-[var(--text-secondary)] shrink-0 opacity-50" />
            <span className="text-sm font-bold text-[var(--text-primary)] truncate">
             {m.name}
            </span>
           </div>
           <span className="text-xs text-[var(--text-secondary)] truncate text-right">
            {m.role}
           </span>
          </div>
         </Reorder.Item>
        ))}
       </Reorder.Group>
      </div>
     </div>
    </div>

    {/* ─── Bottom Section: Launch Control & Logistics AI ─── */}
    <div className="bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-5">
     <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
      <div className="flex items-center gap-2">
       <Cpu size={16} className="text-[var(--accent-primary)]" />
       <h3 className="text-[var(--accent-primary)] font-['Space_Grotesk'] font-bold text-lg tracking-wider">
        WEATHER & LAUNCH CONTROL
       </h3>
      </div>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: ML Prediction */}
      <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-between">
       <div>
        <div className="flex items-center gap-2 mb-2">
         <BrainCircuit size={18} className="text-[var(--accent-primary)]" />
         <h4 className="text-[var(--text-primary)] text-sm font-semibold uppercase tracking-wider">
          Weather Window
         </h4>
        </div>
        <label className="block mb-4 text-[10px] uppercase text-[var(--text-secondary)]">
         Station
         <select value={weatherStation} onChange={event => setWeatherStation(event.target.value)} className="mt-1 block w-full bg-[var(--bg-primary)] border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-primary)]">
          <option value="maitri">Maitri</option>
          <option value="bharati">Bharati</option>
          <option value="himadri">Himadri</option>
         </select>
        </label>
       </div>

       <div>
        <button
         type="button"
         onClick={handlePredictWindow}
         disabled={isPredicting}
         className="w-full py-3 text-sm font-bold tracking-wide flex justify-center items-center gap-2 rounded-lg bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white transition-all duration-200 disabled:opacity-50 cursor-pointer"
        >
         {isPredicting ? (
          <>
           <Loader size={16} className="animate-spin" />
           <span>Fetching live weather...</span>
          </>
         ) : (
          <>
           <BrainCircuit size={16} />
           <span>CHECK WEATHER WINDOW</span>
          </>
         )}
        </button>

        <AnimatePresence>
         {predictionResult && (
          <motion.div
           initial={{ opacity: 0, y: 15, scale: 0.98 }}
           animate={{ opacity: 1, y: 0, scale: 1 }}
           exit={{ opacity: 0, y: -10 }}
           transition={{ duration: 0.3 }}
           className={`mt-4 p-4 rounded-xl border-2 ${predictionResult.safe ? 'border-[var(--ok)] bg-[var(--ok)]/10' : 'border-[var(--critical)] bg-[var(--critical)]/10'}`}
          >
           <div className="flex items-start gap-3">
             <div className={`p-2 rounded-lg shrink-0 ${predictionResult.safe ? 'bg-[var(--ok)]/20 text-[var(--ok)]' : 'bg-[var(--critical)]/20 text-[var(--critical)]'}`}>
             {predictionResult.safe ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}
            </div>
            <div className="flex-1">
             <div className="flex items-center justify-between">
              <h5 className={`font-['Space_Grotesk'] font-bold text-lg tracking-wide ${predictionResult.safe ? 'text-[var(--ok)]' : 'text-[var(--critical)]'}`}>
               {predictionResult.safe ? 'WITHIN MODEL THRESHOLD' : 'NO-GO · WEATHER LIMIT EXCEEDED'}
              </h5>
              <span className="text-[10px] font-mono text-[var(--text-primary)] bg-[var(--bg-panel-raised)] px-2 py-0.5 rounded font-bold">
               WHITEOUT RISK · {predictionResult.probability}%
              </span>
             </div>

             <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--ok)]/20 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
               <Wind size={13} className="text-[var(--accent-primary)]" />
               <span>Wind: <strong className="text-[var(--text-primary)]">{Number(predictionResult.wind).toFixed(1)} m/s</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
               <Compass size={13} className="text-[var(--accent-primary)]" />
               <span>Visibility: <strong className="text-[var(--text-primary)]">{Number(predictionResult.visibilityKm).toFixed(1)} km</strong></span>
              </div>
              <div className="col-span-2 text-[10px] text-[var(--text-secondary)] mt-1 font-mono">
               {predictionResult.source}{predictionResult.stale ? ' · STALE DATA' : ''} · Observed {new Date(predictionResult.observedAt).toLocaleString()}
              </div>
              <p className="col-span-2 text-[10px] text-amber-400">Model trained on synthetic data; not validated for dispatch decisions.</p>
             </div>
            </div>
           </div>
          </motion.div>
         )}
        </AnimatePresence>
        {predictionError && <p role="alert" className="mt-3 text-xs text-[var(--critical)]">{predictionError}</p>}
       </div>
      </div>

      {/* Right Column: Cryptographic Sealing & Broadcast */}
      <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-between">
       <div>
        <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-2">
          <Lock size={18} className="text-[var(--accent-primary)]" />
          <h4 className="text-[var(--text-primary)] text-sm font-semibold uppercase tracking-wider">
           Manifest Sealing
          </h4>
         </div>
         <button onClick={() => { setSealStep('CREATE'); setIsSealModalOpen(true); }} className="px-3 py-1.5 bg-[var(--accent-primary)] text-white text-xs font-bold rounded flex items-center gap-1.5 hover:bg-blue-600 transition-colors shadow-[var(--shadow-glass)]">
           <Plus size={14} /> Create Seal
         </button>
        </div>
       </div>

       <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
         {sealedManifests.length === 0 ? (
           <div className="text-center text-[var(--text-secondary)] text-sm italic py-4">No sealed manifests found.</div>
         ) : (
           sealedManifests.map(manifest => (
            <motion.div
             key={manifest.hash}
             initial={{ opacity: 0, y: 15 }}
             animate={{ opacity: 1, y: 0 }}
             className="p-4 rounded-xl border border-[var(--ok)]/50 bg-[var(--ok)]/5 shadow-[0_0_20px_rgba(74,222,128,0.1)] shrink-0"
            >
             <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-[var(--ok)] text-xs font-bold uppercase tracking-wider">
               <ShieldCheck size={16} />
               Digest Sealed
              </div>
              <span className="text-[10px] text-[var(--ok)] bg-[var(--ok)]/15 border border-[var(--ok)]/30 px-2 py-0.5 rounded font-mono font-bold">
               {manifest.timestamp}
              </span>
             </div>

             <div className="bg-[var(--bg-primary)] p-2.5 rounded border border-[var(--border)] flex flex-col gap-3">
              <div>
               <p className="text-[var(--text-secondary)] text-[10px] uppercase font-semibold mb-1">
                SHA-256 Digest:
               </p>
               <p className="text-[var(--ok)] text-[10px] font-mono break-all leading-relaxed select-all font-semibold">
                {manifest.hash}
               </p>
              </div>
              <div className="pt-2 border-t border-[var(--border)]/50 grid grid-cols-2 gap-4">
               <div>
                <p className="text-[var(--text-secondary)] text-[10px] uppercase font-semibold mb-1">
                 Destination:
                </p>
                <p className="text-[var(--text-primary)] text-xs font-semibold">
                 {manifest.destination}
                </p>
               </div>
               <div>
                <p className="text-[var(--text-secondary)] text-[10px] uppercase font-semibold mb-1">
                 Vessel:
                </p>
                <p className="text-[var(--text-primary)] text-xs font-semibold">
                 {manifest.vessel}
                </p>
               </div>
               <div className="col-span-2">
                <p className="text-[var(--text-secondary)] text-[10px] uppercase font-semibold mb-1">
                 Cargo Loaded:
                </p>
                <ul className="text-[var(--text-primary)] text-xs space-y-0.5 list-disc list-inside">
                 {manifest.items.map((item, idx) => (
                   <li key={idx}>{item.qty} {item.unit} {item.name}</li>
                 ))}
                </ul>
               </div>
              </div>
             </div>
            </motion.div>
           ))
         )}
       </div>
      </div>
     </div>

     {/* Seal Creation Modal */}
     <AnimatePresence>
        {isSealModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-2xl bg-[var(--bg-panel-raised)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden font-['Work_Sans'] relative max-h-[90vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-panel)] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-[var(--accent-primary)]/10 rounded-lg text-[var(--accent-primary)]">
                    <Lock size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-wide">
                      {sealStep === 'CREATE' ? 'Draft New Manifest' : 'Review & Seal Manifest'}
                    </h2>
                  </div>
                </div>
                <button onClick={() => setIsSealModalOpen(false)} className="text-[var(--text-secondary)] hover:text-[var(--critical)] transition-colors">
                  <X size={20}/>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                {sealStep === 'CREATE' ? (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1.5 block tracking-widest">Destination Station</label>
                        <select value={draftManifest.destination} onChange={e => setDraftManifest({...draftManifest, destination: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer shadow-inner">
                          <option value="Himadri">Himadri Station</option>
                          <option value="Bharati">Bharati Station</option>
                          <option value="Maitri">Maitri Station</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold mb-1.5 block tracking-widest">Transport Vessel</label>
                        <select value={draftManifest.vessel} onChange={e => setDraftManifest({...draftManifest, vessel: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer shadow-inner">
                          {availableVessels.map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--border)]">
                        <div>
                          <label className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest block">Cargo Line Items</label>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={addEmptyItem} className="text-xs font-bold text-[var(--accent-primary)] hover:text-blue-400 flex items-center gap-1.5 px-3 py-1.5 bg-[var(--accent-primary)]/10 rounded-lg transition-colors"><Plus size={14}/> Add Asset</button>
                          <button onClick={addCustomItem} className="text-xs font-bold text-[var(--text-secondary)] hover:text-white flex items-center gap-1.5 px-3 py-1.5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg transition-colors"><Plus size={14}/> Custom</button>
                        </div>
                      </div>
                      <div className="space-y-3 mt-4">
                        {draftManifest.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            {item.isCustom ? (
                              <input type="text" placeholder="Custom Item Name" value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)} className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]" />
                            ) : (
                              <select 
                                value={item.name} 
                                onChange={e => {
                                  const val = e.target.value;
                                  const std = standardInventory.find(i => i.name === val);
                                  const newItems = [...draftManifest.items];
                                  newItems[idx].name = val;
                                  if (std) newItems[idx].unit = std.unit;
                                  setDraftManifest({ ...draftManifest, items: newItems });
                                }}
                                className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] cursor-pointer"
                              >
                                <option value="" disabled>Select Approved Asset...</option>
                                {standardInventory.map(inv => <option key={inv.name} value={inv.name}>{inv.name}</option>)}
                              </select>
                            )}
                            <input type="number" placeholder="Qty" value={item.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} className="w-24 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)]" />
                            <input type="text" placeholder="Unit" value={item.unit} readOnly={!item.isCustom} onChange={e => updateItem(idx, 'unit', e.target.value)} className={`w-28 bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] ${!item.isCustom ? 'opacity-70 cursor-not-allowed' : ''}`} />
                            <button type="button" onClick={() => removeItem(idx)} className="text-[var(--text-secondary)] hover:text-white hover:bg-[var(--critical)] p-2 rounded-lg transition-colors bg-[var(--bg-primary)] border border-[var(--border)]"><Minus size={16}/></button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-6">
                     <div className="p-5 bg-[var(--bg-primary)] border border-[var(--border)] rounded-xl flex flex-col gap-5 shadow-inner">
                        <div className="grid grid-cols-2 gap-4">
                           <div>
                             <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest block mb-1">Destination</span>
                             <p className="text-sm font-bold text-[var(--text-primary)]">{draftManifest.destination} Station, Antarctica</p>
                           </div>
                           <div>
                             <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest block mb-1">Vessel</span>
                             <p className="text-sm font-bold text-[var(--text-primary)]">{draftManifest.vessel}</p>
                           </div>
                        </div>
                        <div className="pt-4 border-t border-[var(--border)]/50">
                          <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold tracking-widest block mb-3">Cargo Roster ({draftManifest.items.length} items)</span>
                          <ul className="space-y-2">
                            {draftManifest.items.map((it, i) => (
                              <li key={i} className="text-sm text-[var(--text-primary)] flex justify-between bg-[var(--bg-panel-raised)] px-3 py-2 rounded border border-[var(--border)]">
                                <span className="font-medium">{it.name || 'Unnamed Item'}</span>
                                <span className="font-mono text-[var(--accent-primary)] font-bold">{it.qty} {it.unit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                     </div>
                     <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl flex items-start gap-3">
                        <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-500 font-medium leading-relaxed">Sealing is permanent. Verify the manifest before continuing.</p>
                     </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-[var(--border)] bg-[var(--bg-panel)] flex justify-end gap-3 shrink-0">
                {sealStep === 'CREATE' ? (
                  <>
                    <button onClick={() => setIsSealModalOpen(false)} className="px-5 py-2.5 bg-[var(--bg-primary)] text-[var(--text-secondary)] text-sm font-bold rounded-lg border border-[var(--border)] hover:text-[var(--text-primary)] transition-colors">Cancel</button>
                    <button onClick={() => setSealStep('REVIEW')} className="px-6 py-2.5 bg-[var(--accent-primary)] text-white text-sm font-bold rounded-lg border border-blue-400/30 hover:bg-blue-600 transition-colors shadow-lg">Review Manifest</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setSealStep('CREATE')} className="px-5 py-2.5 bg-[var(--bg-primary)] text-[var(--text-secondary)] text-sm font-bold rounded-lg border border-[var(--border)] hover:text-[var(--text-primary)] transition-colors">Edit Draft</button>
                    <button onClick={handleConfirmSeal} disabled={isSealing} className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold rounded-lg hover:brightness-110 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 border border-emerald-400/30">
                      {isSealing ? <><Loader size={16} className="animate-spin" /> Sealing Digest...</> : <><ShieldCheck size={16} /> Confirm & Seal Manifest</>}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
   </div>
  </div>
 );
}
