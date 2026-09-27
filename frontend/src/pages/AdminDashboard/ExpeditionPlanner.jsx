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
 X,
 AlertTriangle,
 Minus,
} from 'lucide-react';
import { useIceNet } from '../../context/IceNetContext';

const flights = [
 { id: 'CHF-301', route: 'Cape Town → Maitri', date: '2026-10-05', duration: 8, offset: 0, status: 'Confirmed', window: 'Oct 1 - Oct 8' },
 { id: 'CHF-302', route: 'Christchurch → Bharati', date: '2026-10-12', duration: 12, offset: 3, status: 'Pending', window: 'Oct 4 - Oct 16' },
 { id: 'CHF-303', route: 'Tromsø → Himadri', date: '2026-10-18', duration: 5, offset: 6, status: 'Confirmed', window: 'Oct 7 - Oct 12' },
];

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

const budgetData = [
 { name: 'Charter Flights', value: 4.2, color: '#3B82F6' },
 { name: 'Cold Logistics', value: 1.8, color: '#F43F5E' },
 { name: 'Reserve', value: 2.1, color: '#4ade80' },
];

const CustomPieTooltip = ({ active, payload }) => {
 if (active && payload && payload.length) {
  const data = payload[0];
  return (
   <div className="bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] p-2.5 rounded-lg shadow-xl font-['Work_Sans'] text-xs">
    <p className="font-semibold text-[var(--text-primary)]">{data.name}</p>
    <p className="text-[var(--accent-primary)] font-mono font-bold mt-0.5">
     ₹{data.value} Cr ({((data.value / 8.1) * 100).toFixed(1)}%)
    </p>
   </div>
  );
 }
 return null;
};

export default function ExpeditionPlanner() {
 const { sealedManifestHash, setSealedManifestHash } = useIceNet();

 // ML Prediction state
 const [isPredicting, setIsPredicting] = useState(false);
 const [predictionResult, setPredictionResult] = useState(null);

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

 const handlePredictWindow = () => {
  setIsPredicting(true);
  setPredictionResult(null);
  setTimeout(() => {
   setIsPredicting(false);
   setPredictionResult({
    probability: '94%',
    message: 'CLEARANCE: 94% Probability of Clear Window. Safe for Launch.',
    model: 'FastAPI XGBoost Polar-v4.2 (Inference: 18ms)',
    surfaceWind: '12 knots (Gusts 16kt)',
    visibility: '> 10 km (Zero Whiteout Risk)',
    windowValid: '2026-10-08 18:00 UTC',
   });
  }, 2000);
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

 const handleConfirmSeal = () => {
  setIsSealing(true);
  setTimeout(() => {
   const chars = '0123456789abcdef';
   let hash = '';
   for (let i = 0; i < 64; i++) hash += chars[Math.floor(Math.random() * chars.length)];
   
   const newManifest = {
    hash,
    destination: draftManifest.destination + ' Station, Antarctica',
    vessel: draftManifest.vessel,
    items: [...draftManifest.items],
    timestamp: new Date().toLocaleString(),
    sealedBy: 'AdminHQ'
   };
   
   setSealedManifests([newManifest, ...sealedManifests]);
   setSealedManifestHash(hash);
   setIsSealing(false);
   setIsSealModalOpen(false);
   setSealStep('CREATE');
   setDraftManifest({ destination: 'Himadri', vessel: 'Icebreaker SA Agulhas', items: [{ name: 'Seismic Sensors', qty: 12, unit: 'Units' }] });
  }, 1500);
 };

 return (
  <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-6 h-full flex flex-col overflow-hidden overflow-x-hidden w-full max-w-full">
   {/* Dashboard Header */}
   <div className="flex items-center justify-between mb-6 shrink-0 pb-4 border-b border-[var(--border)]">
    <div>
     <h2 className="text-[var(--accent-primary)] font-['Space_Grotesk'] font-bold text-2xl tracking-wide">
      EXPEDITION PLANNER · COMMAND DECK
     </h2>
     <p className="text-[var(--text-secondary)] text-xs font-['Work_Sans']">
      Charter Scheduling · Dynamic INR Capital Budget · Interactive Roster Drag-Drop · Launch Control AI
     </p>
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
    {/* ─── Top Row: Timeline & Interactive Budget ─── */}
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
     {/* Timeline Gantt */}
     <div className="lg:col-span-7 bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-between min-w-0">
      {/* Header & Status Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[var(--border)]">
       <div>
        <h3 className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-widest flex items-center gap-2">
         <Plane size={15} className="text-[var(--accent-primary)]" />
         Chartered Flight Schedule (Gantt)
        </h3>
        {/* Status Legend */}
        <div className="flex items-center gap-4 text-xs font-['Work_Sans'] mt-2">
         <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--ok)]" />
          <span className="text-[var(--text-secondary)]">Confirmed Flight</span>
         </div>
         <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
          <span className="text-[var(--text-secondary)]">Pending Clearance</span>
         </div>
        </div>
       </div>

       <span className="text-[10px] text-[var(--ok)] bg-[var(--ok)]/10 px-2.5 py-1 rounded border border-[var(--ok)] font-semibold font-mono self-start sm:self-center">
        3 Charters Scheduled
       </span>
      </div>

      <div className="space-y-3.5 mb-2">
       <div className="flex items-center text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
        <div className="w-36 shrink-0 font-medium">Vessel / Route</div>
        <div className="flex-1 relative h-4 font-mono text-[10px]">
         {['Oct 1', 'Oct 6', 'Oct 11', 'Oct 16', 'Oct 21', 'Oct 26'].map((d, i) => (
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
            left: `${(f.offset / 25) * 100}%`,
            width: `${(f.duration / 25) * 100}%`,
            backgroundColor: f.status === 'Confirmed' ? 'var(--ok)' : 'var(--accent-primary)',
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
             <span>Window: {f.window}</span>
             <span>|</span>
             <span
              className={
               f.status === 'Confirmed'
                ? 'text-[var(--ok)] font-semibold'
                : 'text-[var(--accent-primary)] font-semibold'
              }
             >
              Status: {f.status}
             </span>
            </div>
           </div>
          </div>
         </div>
         <span
          className={`text-[10px] font-semibold w-16 text-right font-mono ${
           f.status === 'Confirmed' ? 'text-[var(--ok)]' : 'text-[var(--accent-primary)]'
          }`}
         >
          {f.status}
         </span>
        </div>
       ))}
      </div>

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
        INR Budget Allocation (₹8.1 Cr Total)
       </h3>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-6 items-center w-full my-auto">
       {/* Donut Chart */}
       <div className="w-full flex items-center justify-center py-1 min-w-0">
        <div className="w-40 h-40 relative flex items-center justify-center shrink-0">
         <ResponsiveContainer width="100%" height="100%">
          <PieChart>
           <Tooltip content={<CustomPieTooltip />} />
           <Pie
            data={budgetData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={38}
            outerRadius={55}
            stroke="none"
            paddingAngle={3}
           >
            {budgetData.map((entry) => (
             <Cell key={entry.name} fill={entry.color} />
            ))}
           </Pie>
          </PieChart>
         </ResponsiveContainer>
         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[9px] text-[var(--text-secondary)] uppercase tracking-wider">Total</span>
          <span className="font-['Space_Grotesk'] font-bold text-base text-[var(--accent-primary)] leading-none mt-0.5">₹8.1 Cr</span>
         </div>
        </div>
       </div>

       {/* Dense Flex Legend */}
       <div className="flex flex-col gap-2.5 font-['Work_Sans'] w-full">
        {budgetData.map((b) => (
         <div
          key={b.name}
          className="flex items-center justify-between bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 w-full gap-6"
         >
          <div className="flex items-center gap-2 min-w-0">
           <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ backgroundColor: b.color }}
           />
           <span className="text-[var(--text-primary)] text-sm font-medium whitespace-nowrap">
            {b.name}
           </span>
          </div>
          <span className="whitespace-nowrap font-mono text-sm font-bold text-[var(--text-primary)]">
           ₹{b.value} Cr
          </span>
         </div>
        ))}
       </div>
      </div>

      <div className="text-[10px] text-[var(--text-secondary)] pt-2 border-t border-[var(--border)] font-mono flex justify-between">
       <span>Financial Authority: MoES/NCPOR</span>
       <span className="text-[var(--ok)]">Reserve: ₹2.1 Cr (26%)</span>
      </div>
     </div>
    </div>

    {/* ─── Middle Row: Drag-and-Drop Roster Planning ─── */}
    <div className="bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-5">
     <div className="flex items-center justify-between mb-4 pb-3 border-b border-[var(--border)]">
      <div>
       <h3 className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-widest flex items-center gap-2 mb-1">
        <Users size={15} className="text-[var(--accent-primary)]" />
        Tactile Drag-and-Drop Roster Planning
       </h3>
       <span className="text-[10px] text-[var(--text-secondary)] font-mono">
        Reorder personnel priority by dragging cards vertically
       </span>
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
        LAUNCH CONTROL & LOGISTICS AI
       </h3>
      </div>
      <span className="text-[10px] font-mono text-[var(--text-secondary)]">
       FastAPI Inference Engine & Cryptographic Broadcast Gateway
      </span>
     </div>

     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: ML Prediction */}
      <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-5 flex flex-col justify-between">
       <div>
        <div className="flex items-center gap-2 mb-2">
         <BrainCircuit size={18} className="text-[var(--accent-primary)]" />
         <h4 className="text-[var(--text-primary)] text-sm font-semibold uppercase tracking-wider">
          XGBoost Weather Window Inference
         </h4>
        </div>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
         Aggregates Katabatic pressure anomalies, whiteout radar, and polar vortex velocity to calculate chartered launch probabilities.
        </p>
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
           <span>Computing Gradient Boosted Ensemble...</span>
          </>
         ) : (
          <>
           <BrainCircuit size={16} />
           <span>RUN XGBOOST WEATHER MODEL</span>
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
           className="mt-4 p-4 rounded-xl border-2 border-[var(--ok)] bg-[var(--ok)]/10 shadow-[0_0_30px_rgba(74,222,128,0.15)]"
          >
           <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-[var(--ok)]/20 text-[var(--ok)] shrink-0">
             <CheckCircle size={22} />
            </div>
            <div className="flex-1">
             <div className="flex items-center justify-between">
              <h5 className="text-[var(--ok)] font-['Space_Grotesk'] font-bold text-lg tracking-wide">
               {predictionResult.message}
              </h5>
              <span className="text-[10px] font-mono text-[var(--ok)] bg-[var(--ok)]/20 px-2 py-0.5 rounded font-bold">
               CONFIDENCE: {predictionResult.probability}
              </span>
             </div>

             <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--ok)]/20 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
               <Wind size={13} className="text-[var(--ok)]" />
               <span>Wind: <strong className="text-[var(--text-primary)]">{predictionResult.surfaceWind}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
               <Compass size={13} className="text-[var(--ok)]" />
               <span>Vis: <strong className="text-[var(--text-primary)]">{predictionResult.visibility}</strong></span>
              </div>
              <div className="col-span-2 text-[10px] text-[var(--text-secondary)] mt-1 font-mono">
               Model: {predictionResult.model} · Window Open: {predictionResult.windowValid}
              </div>
             </div>
            </div>
           </div>
          </motion.div>
         )}
        </AnimatePresence>
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
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
         Locks cargo manifests into permanent SHA-256 states. Cryptographic digests are broadcast across all edge stations.
        </p>
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
                    <p className="text-xs text-[var(--text-secondary)]">
                      {sealStep === 'CREATE' ? 'Build the cargo list to be cryptographically sealed.' : 'Irreversible cryptographic hashing.'}
                    </p>
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
                          <span className="text-[10px] text-[var(--accent-primary)] font-medium">Pre-filled from approved requisitions</span>
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
                        <p className="text-sm text-amber-500 font-medium leading-relaxed">WARNING: Sealing this manifest generates an immutable SHA-256 hash broadcast to the edge nodes. This action cannot be reversed or edited after sealing.</p>
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
