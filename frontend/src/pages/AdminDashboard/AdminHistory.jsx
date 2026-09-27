import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Search,
 Download,
 ShieldCheck,
 Box,
 Ship,
 AlertTriangle,
 Terminal,
 ChevronDown,
 Clock,
 Radio,
 CheckCircle,
 Hash,
 Shield,
 FileText,
} from 'lucide-react';

const initialLogs = [
 {
  id: 'LOG-8f92a',
  timestamp: '2026-09-26T14:32:00Z',
  category: 'Logistics',
  action: 'Approved 500kg Diesel Fuel transfer to Maitri Station',
  severity: 'info',
  metadata: {
   adminId: 'GOA-HQ-01',
   ipAddress: '192.168.1.44',
   signatureHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  },
 },
 {
  id: 'LOG-7c42b',
  timestamp: '2026-09-26T13:15:20Z',
  category: 'Transport',
  action: 'Rerouted Vessel ICE-9 Freighter to Himadri due to katabatic storm warning',
  severity: 'warning',
  metadata: {
   adminId: 'GOA-NAV-04',
   ipAddress: '192.168.2.18',
   signatureHash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
  },
 },
 {
  id: 'LOG-5d33c',
  timestamp: '2026-09-26T11:48:15Z',
  category: 'Security',
  action: 'Granted security clearance & LoRa mesh crypto keys for Dr. Raj Patel',
  severity: 'info',
  metadata: {
   adminId: 'GOA-SEC-02',
   ipAddress: '192.168.1.99',
   signatureHash: '4f5e6d7c8b9a0f1e2d3c4b5a6f7e8d9c0b1a2f3e4d5c6b7a8f9e0d1c2b3a4f5e',
  },
 },
 {
  id: 'LOG-3a21d',
  timestamp: '2026-09-26T09:30:40Z',
  category: 'System',
  action: 'Automated CRDT Sync Completed · Reconciled edge delta across Maitri & Bharati',
  severity: 'info',
  metadata: {
   adminId: 'SYS-CRDT-DAEMON',
   ipAddress: '10.0.4.12',
   signatureHash: '8b7a6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b',
  },
 },
 {
  id: 'LOG-1f04e',
  timestamp: '2026-09-26T08:05:11Z',
  category: 'Security',
  action: 'Emergency override authorized: Backup diesel microgrid activated at Bharati',
  severity: 'critical',
  metadata: {
   adminId: 'GOA-HQ-01',
   ipAddress: '192.168.1.44',
   signatureHash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
  },
 },
];

const categoryIcons = {
 Logistics: Box,
 Transport: Ship,
 Security: ShieldCheck,
 System: Terminal,
};

const severityStyles = {
 info: {
  dot: 'bg-[var(--ok)]',
  badge: 'text-[var(--ok)] border-[var(--ok)]/40 bg-[var(--ok)]/10',
 },
 warning: {
  dot: 'bg-[var(--accent-primary)]',
  badge: 'text-[var(--accent-primary)] border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10',
 },
 critical: {
  dot: 'bg-[var(--critical)] animate-ping',
  badge: 'text-[var(--critical)] border-[var(--critical)]/40 bg-[var(--critical)]/10',
 },
};

export default function AdminHistory() {
 const [logs, setLogs] = useState(initialLogs);
 const [searchQuery, setSearchQuery] = useState('');
 const [activeCategory, setActiveCategory] = useState('All');
 const [expandedLogId, setExpandedLogId] = useState(null);
 const [exportedStatus, setExportedStatus] = useState(false);

 // Live Log Simulation: Generates new System log every 12 seconds
 useEffect(() => {
  const automatedActions = [
   'Automated CRDT Sync Completed · 3 Nodes Reconciled',
   'Air-gapped SHA-256 manifest integrity verified by edge relay',
   'LoRa Mesh frequency shift to 868.1MHz executed across sector',
   'High-altitude meteorological payload received and committed to ledger',
   'Edge station Maitri NTP clock offset recalibrated to GPS PPS',
  ];

  const interval = setInterval(() => {
   const randomAction =
    automatedActions[Math.floor(Math.random() * automatedActions.length)];
   const randomId = 'LOG-' + Math.random().toString(36).substring(2, 7);
   const randomHash = Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

   const newLog = {
    id: randomId,
    timestamp: new Date().toISOString(),
    category: 'System',
    action: randomAction,
    severity: 'info',
    metadata: {
     adminId: 'SYS-CRDT-DAEMON',
     ipAddress: '10.0.4.12',
     signatureHash: randomHash,
    },
   };

   setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // keep up to 50 logs
  }, 12000);

  return () => clearInterval(interval);
 }, []);

 const handleExport = () => {
  const jsonStr = JSON.stringify(logs, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `icenet-audit-ledger-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  setExportedStatus(true);
  setTimeout(() => setExportedStatus(false), 2500);
 };

 const filteredLogs = logs.filter((log) => {
  const matchesCategory =
   activeCategory === 'All' || log.category === activeCategory;
  const matchesSearch =
   log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
   log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
   log.metadata.adminId.toLowerCase().includes(searchQuery.toLowerCase()) ||
   log.metadata.signatureHash.toLowerCase().includes(searchQuery.toLowerCase());
  return matchesCategory && matchesSearch;
 });

 return (
  <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-6 h-full flex flex-col overflow-hidden">
   {/* Header */}
   <div className="flex items-center justify-between mb-6 shrink-0">
    <div>
     <h2 className="text-[var(--accent-primary)] font-['Space_Grotesk'] font-bold text-2xl tracking-wide">
      ADMIN HISTORY · CRYPTOGRAPHIC AUDIT LEDGER
     </h2>
     <p className="text-[var(--text-secondary)] text-xs font-['Work_Sans']">
      Immutable SHA-256 Action Ledger · Multi-Party Signatures · Live Automated Sync
     </p>
    </div>

    <div className="flex items-center gap-3">
     <div className="flex items-center gap-2 bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] px-3 py-1.5 rounded-lg border border-[var(--border)] text-xs font-mono">
      <Radio size={14} className="text-[var(--ok)] animate-pulse" />
      <span className="text-[var(--text-secondary)]">Ledger State:</span>
      <span className="text-[var(--ok)] font-semibold">SYNCHRONIZED (12s Tick)</span>
     </div>
    </div>
   </div>

   {/* Top Control Bar */}
   <div className="flex flex-wrap items-center justify-between gap-4 mb-6 shrink-0">
    {/* Search Input */}
    <div className="relative w-72 max-w-full">
     <Search
      size={14}
      className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]"
     />
     <input
      type="text"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder="Search action, ID, hash, or admin..."
      className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors font-['Work_Sans']"
     />
    </div>

    {/* Category Filter Pills */}
    <div className="flex items-center gap-2">
     {['All', 'Logistics', 'Security', 'System', 'Transport'].map((cat) => (
      <button
       key={cat}
       type="button"
       onClick={() => setActiveCategory(cat)}
       className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
        activeCategory === cat
         ? 'border border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] shadow-sm'
         : 'border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)]'
       }`}
      >
       {cat}
      </button>
     ))}
    </div>

    {/* Export Button */}
    <button
     type="button"
     onClick={handleExport}
     className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-lg bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-colors font-['Work_Sans'] text-xs font-medium cursor-pointer ml-auto"
    >
     {exportedStatus ? (
      <>
       <CheckCircle size={14} className="text-[var(--ok)]" />
       <span className="text-[var(--ok)]">DOWNLOADED</span>
      </>
     ) : (
      <>
       <Download size={14} />
       <span>EXPORT LEDGER</span>
      </>
     )}
    </button>
   </div>

   {/* Ledger Feed */}
   <div className="flex-1 overflow-y-auto pr-1">
    <AnimatePresence initial={false}>
     {filteredLogs.length === 0 ? (
      <motion.div
       initial={{ opacity: 0 }}
       animate={{ opacity: 1 }}
       className="text-center py-12 text-[var(--text-secondary)] text-sm"
      >
       No ledger entries matching your query or filter.
      </motion.div>
     ) : (
      filteredLogs.map((log) => {
       const Icon = categoryIcons[log.category] || Terminal;
       const isExpanded = expandedLogId === log.id;
       const timeDisplay = new Date(log.timestamp).toLocaleTimeString(
        'en-GB',
        { hour: '2-digit', minute: '2-digit', second: '2-digit' }
       );
       const dateDisplay = new Date(log.timestamp).toISOString().slice(0, 10);

       return (
        <motion.div
         key={log.id}
         layout
         initial={{ opacity: 0, y: -20 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ duration: 0.25 }}
         className="mb-3 border border-[var(--border)] rounded-lg bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] overflow-hidden shadow-sm hover:border-[var(--accent-primary)]/50 transition-colors"
        >
         {/* Main Clickable Row */}
         <div
          onClick={() =>
           setExpandedLogId(isExpanded ? null : log.id)
          }
          className="p-3.5 flex items-center justify-between gap-4 cursor-pointer select-none"
         >
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
           {/* Category Icon with Severity Dot */}
           <div className="relative p-2 rounded-lg bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] text-[var(--accent-primary)] shrink-0">
            <Icon size={16} />
            <span
             className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${
              severityStyles[log.severity]?.dot || 'bg-[var(--ok)]'
             }`}
            />
           </div>

           {/* Log Action & Timestamp */}
           <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
             <span className="font-mono text-[11px] text-[var(--accent-primary)] font-semibold">
              {log.id}
             </span>
             <span className="text-[10px] text-[var(--text-secondary)] font-mono flex items-center gap-1">
              <Clock size={10} />
              {timeDisplay} UTC ({dateDisplay})
             </span>
            </div>
            <p className="text-[var(--text-primary)] text-sm font-['Work_Sans'] truncate font-medium">
             {log.action}
            </p>
           </div>
          </div>

          {/* Category Badge & Expand Chevron */}
          <div className="flex items-center gap-3 shrink-0">
           <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] text-[var(--text-secondary)] font-semibold">
            {log.category}
           </span>
           <ChevronDown
            size={16}
            className={`text-[var(--text-secondary)] transition-transform duration-200 ${
             isExpanded ? 'rotate-180 text-[var(--accent-primary)]' : ''
            }`}
           />
          </div>
         </div>

         {/* Expanded Metadata (The Crypto Terminal View) */}
         <AnimatePresence>
          {isExpanded && (
           <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
           >
            <div className="bg-[var(--bg-primary)] p-4 font-mono text-xs text-[var(--text-secondary)] border-t border-[var(--border)]">
             <div className="flex items-center justify-between pb-2 mb-3 border-b border-[var(--border)]">
              <span className="flex items-center gap-1.5 text-[var(--accent-primary)] font-semibold text-[11px] uppercase tracking-wider">
               <Terminal size={13} />
               Cryptographic Header & Payload Proof
              </span>
              <span className="text-[10px] text-[var(--ok)] bg-[var(--ok)]/10 border border-[var(--ok)]/40 px-2 py-0.5 rounded flex items-center gap-1">
               <CheckCircle size={10} />
               SIGNATURE VALID
              </span>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <div>
               <span className="text-[var(--text-secondary)] uppercase text-[10px] block mb-0.5">
                Operator / Origin Admin:
               </span>
               <span className="text-[var(--text-primary)] font-bold">
                {log.metadata.adminId}
               </span>
              </div>
              <div>
               <span className="text-[var(--text-secondary)] uppercase text-[10px] block mb-0.5">
                Origin IP / Node Address:
               </span>
               <span className="text-[var(--text-primary)]">
                {log.metadata.ipAddress}
               </span>
              </div>
             </div>

             <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] p-3 rounded border border-[var(--border)]">
              <span className="text-[var(--text-secondary)] uppercase text-[10px] block mb-1">
               SHA-256 Cryptographic Signature Hash:
              </span>
              <p className="text-[var(--accent-primary)] font-bold text-xs break-all leading-relaxed select-all">
               {log.metadata.signatureHash}
              </p>
             </div>

             <div className="flex items-center justify-between mt-3 text-[10px] text-[var(--text-secondary)]">
              <span>Hash Engine: SHA-256 Polar-Ledger-SecP256k1</span>
              <span>Immutable Node State: Block Verified</span>
             </div>
            </div>
           </motion.div>
          )}
         </AnimatePresence>
        </motion.div>
       );
      })
     )}
    </AnimatePresence>
   </div>
  </div>
 );
}
