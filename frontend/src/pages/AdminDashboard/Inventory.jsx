import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, WifiOff, AlertTriangle, CheckCircle, Clock, Search, X, Satellite, MapPin } from 'lucide-react';

export default function AdminInventory() {
  const [activeCenter, setActiveCenter] = useState('Himadri');

  const [inventoryData] = useState({
    Himadri: [
      { id: 1, name: 'Aviation Fuel (ATF)', qty: 12500, unit: 'L' },
      { id: 2, name: 'Thermal Rations', qty: 4200, unit: 'Packs' },
      { id: 3, name: 'Medical Kits (Trauma)', qty: 150, unit: 'Units' },
      { id: 4, name: 'IoT Base Stations', qty: 8, unit: 'Nodes' },
    ],
    Bharati: [
      { id: 5, name: 'Diesel (Marine Grade)', qty: 25000, unit: 'L' },
      { id: 6, name: 'Deep Freeze Suits', qty: 45, unit: 'Sets' },
      { id: 7, name: 'Emergency Beacons', qty: 12, unit: 'Units' },
    ],
    Maitri: [
      { id: 8, name: 'Generator Bearings', qty: 4, unit: 'Crates' },
      { id: 9, name: 'Antibiotics Box', qty: 200, unit: 'Packs' },
      { id: 10, name: 'Satellite Dish Spares', qty: 2, unit: 'Units' },
    ]
  });

  const [reqQueue, setReqQueue] = useState({
    Himadri: [
      { id: 201, item: 'Seismic Sensors', qty: 12, time: '2026-09-27T08:15:00Z', urgency: 'CRITICAL' },
      { id: 202, item: 'Aviation Fuel (ATF)', qty: 500, time: '2026-09-27T08:20:00Z', urgency: 'ROUTINE' },
    ],
    Bharati: [
      { id: 203, item: 'Oxygen Cylinders', qty: 25, time: '2026-09-27T09:10:00Z', urgency: 'CRITICAL' },
    ],
    Maitri: []
  });

  const [outboundQueue, setOutboundQueue] = useState({
    Himadri: [],
    Bharati: [],
    Maitri: []
  });

  const syncHealth = {
    Himadri: { time: '72h ago', pending: 12, stale: true },
    Bharati: { time: '2m ago', pending: 0, stale: false },
    Maitri: { time: '45m ago', pending: 3, stale: false }
  };

  const handleApprove = (id) => {
    const centerReqs = reqQueue[activeCenter];
    const req = centerReqs.find(r => r.id === id);
    if (!req) return;
    
    setReqQueue(prev => ({
      ...prev,
      [activeCenter]: prev[activeCenter].filter(r => r.id !== id)
    }));
    
    const outId = Date.now();
    setOutboundQueue(prev => ({
      ...prev,
      [activeCenter]: [{ ...req, status: 'Sent — awaiting ack', decision: 'Approve', outId }, ...prev[activeCenter]]
    }));

    setTimeout(() => {
      setOutboundQueue(prev => ({
        ...prev,
        [activeCenter]: prev[activeCenter].map(o => o.outId === outId ? { ...o, status: 'Acknowledged by station' } : o)
      }));
    }, 5000);
  };

  const handleDeny = (id) => {
    const centerReqs = reqQueue[activeCenter];
    const req = centerReqs.find(r => r.id === id);
    if (!req) return;
    
    setReqQueue(prev => ({
      ...prev,
      [activeCenter]: prev[activeCenter].filter(r => r.id !== id)
    }));
    
    const outId = Date.now();
    setOutboundQueue(prev => ({
      ...prev,
      [activeCenter]: [{ ...req, status: 'Sent — awaiting ack', decision: 'Deny', outId }, ...prev[activeCenter]]
    }));

    setTimeout(() => {
      setOutboundQueue(prev => ({
        ...prev,
        [activeCenter]: prev[activeCenter].map(o => o.outId === outId ? { ...o, status: 'Acknowledged by station' } : o)
      }));
    }, 5000);
  };

  const currentInventory = inventoryData[activeCenter];
  const currentReqs = reqQueue[activeCenter];
  const currentOutbound = outboundQueue[activeCenter];

  return (
    <div className="w-full h-full p-4 lg:p-8 overflow-y-auto font-['Work_Sans']">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--bg-panel-raised)] rounded-xl shadow-[var(--shadow-glass)] border border-[var(--border)] text-[var(--accent-primary)]">
            <Database size={28} />
          </div>
          <div>
            <h2 className="text-3xl font-bold font-['Space_Grotesk'] text-[var(--text-primary)] tracking-tight">The Cloud Hub</h2>
            <p className="text-[var(--text-secondary)] text-sm flex items-center gap-2">
              <Satellite size={14} className="text-[var(--accent-primary)]" /> Global Oversight & Decision Queuing
            </p>
          </div>
        </div>
      </div>

      {/* Station Selector */}
      <div className="mb-8">
        <h3 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3 flex items-center gap-2">
          <MapPin size={14} /> Select Edge Node (Station)
        </h3>
        <div className="flex flex-wrap gap-3">
          {['Himadri', 'Bharati', 'Maitri'].map(center => (
            <button 
              key={center}
              onClick={() => setActiveCenter(center)}
              className={`px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-3 ${
                activeCenter === center 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)] border border-blue-400/30' 
                  : 'bg-[var(--bg-panel)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-raised)] hover:border-[var(--border-hover)]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${activeCenter === center ? 'bg-white animate-pulse' : (syncHealth[center].stale ? 'bg-amber-500' : 'bg-[var(--ok)]')}`}></span>
              <div className="flex flex-col items-start text-left">
                <span>{center} Station</span>
                <span className={`text-[9px] font-normal font-mono mt-0.5 ${activeCenter === center ? 'text-white/80' : (syncHealth[center].stale ? 'text-amber-500/80' : 'text-[var(--text-secondary)] opacity-80')}`}>
                  Sync: {syncHealth[center].time} • {syncHealth[center].pending} pending
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Module 1: Read-Only Inventory Mirror */}
        <div className="flex flex-col gap-6">
          
          {/* Staleness Banner */}
          <motion.div 
            key={`banner-${activeCenter}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl shadow-[var(--shadow-glass)] flex items-start gap-3"
          >
            <AlertTriangle size={24} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-amber-500 text-sm uppercase tracking-wide">CAUTION: Base link severed</h4>
              <p className="text-amber-500/80 text-xs mt-1 leading-relaxed">
                <span className="font-bold">{activeCenter}'s</span> inventory mirror is <span className="font-black text-amber-400">72 HOURS STALE</span>. Verify carefully before approving requisitions. Passive CRDT updates are failing to sync from Edge Nodes.
              </p>
            </div>
          </motion.div>

          <motion.div 
            key={`mirror-${activeCenter}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-[var(--shadow-glass)] p-6"
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Space_Grotesk'] mb-4 flex items-center gap-2">
              <Search size={18} className="text-[var(--accent-primary)]" />
              {activeCenter} Inventory Mirror
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] text-xs uppercase tracking-wider text-[var(--text-secondary)]">
                    <th className="pb-3 font-semibold">Asset ID</th>
                    <th className="pb-3 font-semibold">Asset Name</th>
                    <th className="pb-3 font-semibold text-right">Stale Qty</th>
                  </tr>
                </thead>
                <tbody>
                  {currentInventory.map(item => (
                    <tr key={item.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-panel-raised)] transition-colors">
                      <td className="py-3 text-xs font-mono text-[var(--text-secondary)] opacity-50">SYS-{item.id}</td>
                      <td className="py-3 text-sm font-semibold text-[var(--text-primary)]">{item.name}</td>
                      <td className="py-3 text-sm font-mono text-[var(--text-primary)] text-right">
                        {item.qty} <span className="text-[10px] text-[var(--text-secondary)]">{item.unit}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 p-3 bg-black/50 border border-[var(--border)] rounded flex items-center justify-center gap-2">
              <WifiOff size={14} className="text-[var(--text-secondary)] opacity-50" />
              <span className="text-xs font-mono text-[var(--text-secondary)] opacity-50 uppercase tracking-widest">Read Only Mode Enforced ({activeCenter})</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6">
          
          {/* Module 2: Requisition Queue */}
          <motion.div 
            key={`reqs-${activeCenter}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-[var(--shadow-glass)] p-6"
          >
            <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Space_Grotesk'] mb-4 flex items-center gap-2">
              <Database size={18} className="text-rose-500" />
              {activeCenter} Active Requisition Feed
            </h3>
            
            <div className="flex flex-col gap-4 min-h-[200px]">
              <AnimatePresence>
                {currentReqs.length === 0 && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-[var(--text-secondary)] italic">No pending requisitions from {activeCenter}.</p>
                  </motion.div>
                )}
                {currentReqs.map((req) => (
                  <motion.div 
                    key={req.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.9 }}
                    className="p-4 rounded-lg bg-[var(--bg-panel-raised)] border border-[var(--border)] shadow-[var(--shadow-glass)] hover:border-[var(--border-hover)] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-[var(--text-primary)] text-sm">Edge Request: <span className="text-rose-500">{req.qty}x {req.item}</span></h4>
                        <p className="text-[10px] text-[var(--text-secondary)] font-mono mt-1"><Clock size={10} className="inline mr-1"/>{new Date(req.time).toLocaleString()}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-1 rounded bg-[var(--bg-primary)] border border-[var(--border)] ${req.urgency === 'CRITICAL' ? 'text-[var(--critical)] animate-pulse' : 'text-[var(--text-secondary)]'}`}>
                        [{req.urgency}]
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleApprove(req.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 bg-[var(--ok)]/10 hover:bg-[var(--ok)] text-[var(--ok)] hover:text-white border border-[var(--ok)]/30 rounded text-xs font-bold transition-colors shadow-sm"
                      >
                        <CheckCircle size={14} /> APPROVE
                      </button>
                      <button 
                        onClick={() => handleDeny(req.id)}
                        className="flex-none px-4 py-2 bg-[var(--bg-primary)] hover:bg-[var(--critical)] text-[var(--text-secondary)] hover:text-white border border-[var(--border)] rounded text-xs font-bold transition-colors shadow-sm"
                      >
                        <X size={14} /> DENY
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Module 3: Outbound Decision Queue */}
          <motion.div 
            key={`outbound-${activeCenter}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-[var(--shadow-glass)] p-6 overflow-hidden relative"
          >
            {/* Status Bar */}
            <div className="absolute top-0 left-0 right-0 bg-black/80 px-6 py-2 flex items-center justify-between border-b border-[var(--border)]">
              <div className="flex items-center gap-2">
                <WifiOff size={14} className="text-[var(--critical)]" />
                <span className="text-[10px] font-mono font-bold text-[var(--critical)] tracking-widest">SATELLITE OFFLINE</span>
              </div>
              <span className="text-[10px] font-mono text-[var(--text-secondary)]">STORE & FORWARD OUTBOUND</span>
            </div>

            <h3 className="text-lg font-bold text-[var(--text-primary)] font-['Space_Grotesk'] mb-4 mt-8 flex items-center gap-2">
              <Clock size={18} className="text-[var(--text-secondary)]" />
              {activeCenter} Outbound Decision Queue
            </h3>

            <div className="bg-[var(--bg-primary)] rounded-lg border border-[var(--border)] p-4 shadow-inner min-h-[120px]">
              {currentOutbound.length === 0 ? (
                <p className="text-xs text-[var(--text-secondary)] opacity-50 text-center mt-6">No decisions queued for next {activeCenter} pass.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  <AnimatePresence>
                    {currentOutbound.map(item => (
                      <motion.li 
                        key={item.outId}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="text-sm font-mono flex items-center justify-between p-2 bg-[var(--bg-panel-raised)] rounded border border-[var(--border)]"
                      >
                        <span className="text-[var(--text-primary)] truncate max-w-[200px]">{item.qty}x {item.item}</span>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${item.decision === 'Approve' ? 'bg-[var(--ok)]/20 text-[var(--ok)] border border-[var(--ok)]/30' : 'bg-[var(--critical)]/20 text-[var(--critical)] border border-[var(--critical)]/30'}`}>
                            {item.decision}
                          </span>
                          <span className="text-[9px] text-[var(--text-secondary)] opacity-80">{item.status}</span>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
            <p className="text-[10px] text-center text-[var(--text-secondary)] mt-3">Waiting for next orbital pass to sync decisions to {activeCenter} Edge Node...</p>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
