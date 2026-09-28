import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, Search, Plus, Minus, AlertCircle, Send, X, Clock, CloudOff, RefreshCw, CheckCircle, XCircle, Trash2, AlertTriangle } from 'lucide-react';

const mockData = [
  { id: 1, name: 'Aviation Turbine Fuel (ATF)', category: 'FUEL', qty: 15010, unit: 'Liters', shelfNumber: 'TNK-01' },
  { id: 2, name: 'Epinephrine', category: 'MEDICAL', qty: 60, unit: 'Vials', shelfNumber: 'MED-A4' },
  { id: 3, name: 'Generator Bearings', category: 'TECHNICAL SPARES', qty: 12, unit: 'Units', warning: 'Will deplete in ≈12d — resupply in 45d', shelfNumber: 'ENG-B2' },
  { id: 4, name: 'Freeze-Dried Rations', category: 'PERISHABLES', qty: 800, unit: 'Packs', shelfNumber: 'RTV-12' },
  { id: 5, name: 'Diesel (Ground Transport)', category: 'FUEL', qty: 8000, unit: 'Liters', shelfNumber: 'TNK-02' },
  { id: 6, name: 'Ibuprofen Tablets', category: 'MEDICAL', qty: 450, unit: 'Tabs', shelfNumber: 'MED-A1' },
  { id: 7, name: 'Lithium Battery Packs', category: 'TECHNICAL SPARES', qty: 45, unit: 'Units', shelfNumber: 'ENG-C1' },
  { id: 8, name: 'Potable Water Reserves', category: 'PERISHABLES', qty: 6500, unit: 'Liters', shelfNumber: 'TNK-03' },
];

function InventoryCard({ item, onRemove, onAdjust }) {
  const [draftQty, setDraftQty] = useState('');

  const handleAdjustDraft = (amount) => {
    const current = parseInt(draftQty) || 0;
    setDraftQty((current + amount).toString());
  };

  const handleApplyAdd = () => {
    const val = parseInt(draftQty);
    if (!isNaN(val) && val !== 0) {
      onAdjust(item.id, Math.abs(val));
      setDraftQty('');
    }
  };

  const handleApplyRemove = () => {
    const val = parseInt(draftQty);
    if (!isNaN(val) && val !== 0) {
      onAdjust(item.id, -Math.abs(val));
      setDraftQty('');
    }
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border)] rounded-xl p-5 shadow-[var(--shadow-glass)] flex flex-col hover:border-[var(--border-hover)] transition-colors relative group"
    >
      <button 
        onClick={() => onRemove(item.id)}
        className="absolute top-4 right-4 p-2 rounded-full bg-[var(--bg-panel-raised)] text-[var(--text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity hover:text-[var(--critical)] hover:bg-[var(--critical)]/10 z-10"
        title="Remove Item"
      >
        <Trash2 size={16} />
      </button>

      <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1 leading-tight pr-8">{item.name}</h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-bold tracking-widest text-[var(--accent-primary)] uppercase">{item.category}</span>
        {item.shelfNumber && (
          <span className="text-[10px] font-bold tracking-widest text-[var(--text-secondary)] border border-[var(--border)] px-1.5 py-0.5 rounded-sm uppercase">SHELF: {item.shelfNumber}</span>
        )}
      </div>
      
      <div className="flex items-baseline gap-2 mb-4">
        <span className="text-4xl font-black font-['Space_Grotesk'] text-[var(--text-primary)] tracking-tight">
          {item.qty.toLocaleString()}
        </span>
        <span className="text-sm font-medium text-[var(--text-secondary)]">{item.unit}</span>
      </div>

      {item.warning && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded text-amber-500 text-xs font-semibold">
          <AlertCircle size={14} />
          {item.warning}
        </div>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => handleAdjustDraft(-10)} className="py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-xs font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] transition-colors">- 10</button>
          <button onClick={() => handleAdjustDraft(10)} className="py-2 bg-[var(--bg-panel-raised)] border border-[var(--border)] rounded text-xs font-bold text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] transition-colors">+ 10</button>
        </div>
        <div className="flex gap-2">
          <input 
            type="number" 
            placeholder="Custom qty..." 
            value={draftQty}
            onChange={(e) => setDraftQty(e.target.value)}
            className="flex-1 min-w-0 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
          <button onClick={handleApplyRemove} className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border)] rounded text-[var(--text-secondary)] hover:text-[var(--critical)] hover:border-[var(--critical)] transition-colors shrink-0">
            <Minus size={14} />
          </button>
          <button onClick={handleApplyAdd} className="px-4 py-2 bg-[var(--bg-panel-raised)] border border-[var(--border)] rounded flex items-center gap-1 text-xs font-bold text-[var(--text-primary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-colors shrink-0">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommanderInventory() {
  const [items, setItems] = useState(mockData);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  // Add Item Modal State
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [newItemData, setNewItemData] = useState({ name: '', category: 'FUEL', qty: '', unit: '', warning: '', shelfNumber: '' });

  const handleAddItemSubmit = (e) => {
    e.preventDefault();
    const newItem = {
      ...newItemData,
      id: Date.now(),
      qty: Number(newItemData.qty)
    };
    setItems([newItem, ...items]);
    setIsAddItemModalOpen(false);
    setNewItemData({ name: '', category: 'FUEL', qty: '', unit: '', warning: '', shelfNumber: '' });
  };

  // Delete Item State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleRequestRemoveItem = (id) => {
    const item = items.find(i => i.id === id);
    if (item) {
      setItemToDelete(item);
      setDeleteConfirmText('');
      setIsDeleteModalOpen(true);
    }
  };

  const handleConfirmDelete = (e) => {
    e.preventDefault();
    if (deleteConfirmText === 'REMOVE' && itemToDelete) {
      setItems(items.filter(item => item.id !== itemToDelete.id));
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Requisition State
  const [reqAsset, setReqAsset] = useState('');
  const [customAsset, setCustomAsset] = useState('');
  const [reqQty, setReqQty] = useState('');
  const [reqUrgency, setReqUrgency] = useState('ROUTINE');
  const [syncState, setSyncState] = useState('IDLE');

  // Status Log State
  const [reqHistory, setReqHistory] = useState([
    { id: 102, item: 'Seismic Sensors', qty: 12, unit: 'Units', urgency: 'ROUTINE', status: 'PENDING_APPROVAL', time: new Date(Date.now() - 3600000).toLocaleTimeString() },
    { id: 101, item: 'Medical Kits (Trauma)', qty: 5, unit: 'Units', urgency: 'CRITICAL', status: 'ACKNOWLEDGED', time: new Date(Date.now() - 86400000).toLocaleTimeString() }
  ]);

  const tabs = ['All', 'Fuel', 'Medical', 'Technical Spares', 'Perishables'];

  const handleAdjust = (id, amount) => {
    setItems(items.map(item => item.id === id ? { ...item, qty: Math.max(0, item.qty + amount) } : item));
  };

  const updateReqStatus = (reqId, newStatus, delay) => {
    setTimeout(() => {
      setReqHistory(prev => prev.map(r => r.id === reqId ? { ...r, status: newStatus } : r));
    }, delay);
  };

  const handleRequisition = (e) => {
    e.preventDefault();
    const finalAsset = reqAsset === 'OTHER' ? customAsset : reqAsset;
    if (!finalAsset || !reqQty) return;
    
    setSyncState('SYNCING');
    
    const matched = items.find(i => i.name === reqAsset);
    const unit = matched ? matched.unit : (reqAsset === 'OTHER' ? 'Units' : '');
    
    setTimeout(() => {
      setSyncState('QUEUED');
      
      const newReq = {
        id: Date.now(),
        item: finalAsset,
        qty: reqQty,
        unit: unit,
        urgency: reqUrgency,
        status: 'QUEUED_LOCALLY',
        time: new Date().toLocaleTimeString()
      };
      
      setReqHistory(prev => [newReq, ...prev]);

      updateReqStatus(newReq.id, 'IN_TRANSIT_UNCONFIRMED', 4000);
      updateReqStatus(newReq.id, 'PENDING_APPROVAL', 8000);
      updateReqStatus(newReq.id, 'DECISION_IN_TRANSIT', 14000);
      updateReqStatus(newReq.id, 'ACKNOWLEDGED', 20000);

      setTimeout(() => {
        setSyncState('IDLE');
        setReqAsset('');
        setCustomAsset('');
        setReqQty('');
        setReqUrgency('ROUTINE');
        setIsModalOpen(false);
      }, 1500);
    }, 1500);
  };

  const filteredItems = items.filter(item => {
    if (activeTab !== 'All' && item.category !== activeTab.toUpperCase()) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const matchedItem = items.find(i => i.name === reqAsset);
  const derivedUnit = matchedItem ? matchedItem.unit : (reqAsset === 'OTHER' ? 'Units' : '');

  const getStatusDisplay = (status) => {
    switch (status) {
      case 'QUEUED_LOCALLY':
        return { label: 'Queued Locally (Awaiting Uplink)', icon: CloudOff, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/30' };
      case 'IN_TRANSIT_UNCONFIRMED':
        return { label: 'In Transit (No HQ Delivery Confirmation)', icon: Radio, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' };
      case 'PENDING_APPROVAL':
        return { label: 'Received at HQ (Awaiting Decision)', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/30' };
      case 'DECISION_IN_TRANSIT':
        return { label: 'Decision In Transit (Sync Pending)', icon: RefreshCw, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' };
      case 'ACKNOWLEDGED':
        return { label: 'Decision Acknowledged by Edge Node', icon: CheckCircle, color: 'text-[var(--ok)]', bg: 'bg-[var(--ok)]/10 border-[var(--ok)]/30' };
      case 'DENIED':
        return { label: 'Denied', icon: XCircle, color: 'text-[var(--critical)]', bg: 'bg-[var(--critical)]/10 border-[var(--critical)]/30' };
      default:
        return { label: status, icon: Clock, color: 'text-[var(--text-secondary)]', bg: 'bg-[var(--bg-panel-raised)] border-[var(--border)]' };
    }
  };

  return (
    <div className="w-full h-full p-4 lg:p-8 overflow-y-auto font-['Work_Sans'] flex flex-col relative">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-[var(--text-primary)] tracking-tight mb-2">Offline-First Inventory</h1>
          <p className="text-sm text-[var(--text-secondary)] max-w-2xl leading-relaxed">
            All changes are recorded locally via CRDT (Yjs). When offline, edits are queued to IndexedDB and automatically merged conflict-free on reconnect.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--ok)]/10 border border-[var(--ok)]/30 rounded-full text-[var(--ok)] shadow-[var(--shadow-glass)]">
          <Wifi size={16} />
          <span className="text-sm font-bold tracking-wide">Cloud Synced</span>
        </div>
      </div>

      {/* Toolbar Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-[var(--accent-primary)] text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                  : 'bg-[var(--bg-panel)] text-[var(--text-secondary)] border border-[var(--border)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel-raised)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search & Add Item */}
        <div className="flex w-full lg:w-auto gap-3">
          <div className="relative flex-1 lg:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg pl-9 pr-4 py-2 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent-primary)] shadow-[var(--shadow-glass)] transition-colors"
            />
          </div>
          {/* Restored Add Item Button */}
          <button 
            onClick={() => setIsAddItemModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 bg-[var(--bg-panel-raised)] text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] rounded-lg text-sm font-bold transition-all shadow-[var(--shadow-glass)] shrink-0"
          >
            <Plus size={16} /> Add Item
          </button>
        </div>
      </div>

      {/* Grid Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8 shrink-0">
        <AnimatePresence>
          {filteredItems.map(item => (
            <InventoryCard 
              key={item.id} 
              item={item} 
              onRemove={handleRequestRemoveItem} 
              onAdjust={handleAdjust} 
            />
          ))}
        </AnimatePresence>
      </div>

      {/* ──────────────────────────────────────────────────────────
          BOTTOM SECTION: REQUEST ASSET BUTTON + LIFECYCLE LOG
          ────────────────────────────────────────────────────────── */}
      <div className="mt-auto grid grid-cols-1 xl:grid-cols-12 gap-6 shrink-0">
        
        {/* Request Asset Action Area */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 xl:col-span-8 bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-[var(--shadow-glass)] p-8 flex flex-col items-center justify-center min-h-[250px]"
        >
          <div className="text-center max-w-md">
            <h3 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] mb-3">Official Station Requisition</h3>
            <p className="text-sm text-[var(--text-secondary)] mb-8">
              Initiate a formal uplink request for critical assets not currently available in local stockpiles. Request will be queued for the next available satellite pass.
            </p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full md:w-auto px-10 py-4 bg-gradient-to-b from-blue-500 to-blue-600 text-white hover:from-blue-400 hover:to-blue-500 border border-blue-400/30 rounded-xl text-base font-bold transition-all shadow-[var(--shadow-glass)] hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
            >
              <Send size={20} /> Request Asset
            </button>
          </div>
        </motion.div>

        {/* Status Lifecycle Log */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="col-span-1 xl:col-span-4 bg-[var(--bg-panel)] backdrop-blur-xl border border-[var(--border)] rounded-xl shadow-[var(--shadow-glass)] p-5 flex flex-col h-full min-h-[250px] max-h-[300px]"
        >
          <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-4 flex items-center gap-2">
            <Clock size={16} /> Request Lifecycle Status
          </h3>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            <AnimatePresence>
              {reqHistory.length === 0 && (
                <p className="text-xs text-[var(--text-secondary)] italic">No active requests.</p>
              )}
              {reqHistory.map((req) => {
                const ui = getStatusDisplay(req.status);
                const Icon = ui.icon;
                return (
                  <motion.div 
                    key={req.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`p-3 rounded-lg border ${ui.bg} flex flex-col gap-2 shadow-sm transition-colors duration-500`}
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-bold text-[var(--text-primary)] leading-tight">{req.qty} {req.unit} <br/><span className="text-[var(--text-secondary)] text-xs font-normal">{req.item}</span></span>
                      <span className="text-[10px] font-mono text-[var(--text-secondary)] opacity-80">{req.time}</span>
                    </div>
                    <div className={`flex items-center gap-1.5 text-[11px] font-bold tracking-wide ${ui.color}`}>
                      <Icon size={14} className={req.status === 'DECISION_QUEUED' ? 'animate-spin' : ''} />
                      {ui.label}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>

      {/* ──────────────────────────────────────────────────────────
          MODAL: Submit Official Station Requisition
          ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isModalOpen && (
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
              className="w-full max-w-lg bg-[var(--bg-panel-raised)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden font-['Work_Sans'] relative"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-panel)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent-primary)]/10 to-transparent pointer-events-none"></div>
                <h2 className="text-lg font-bold text-[var(--accent-primary)] font-['Space_Grotesk'] tracking-wide relative z-10">
                  Submit Official Station Requisition
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)} 
                  className="text-[var(--text-secondary)] hover:text-[var(--critical)] transition-colors relative z-10"
                >
                  <X size={20}/>
                </button>
              </div>
              
              {/* Modal Body */}
              <form onSubmit={handleRequisition} className="p-6 flex flex-col gap-6">
                
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-widest">
                    Target Inventory Item
                  </label>
                  <div className="relative">
                    <select 
                      value={reqAsset}
                      onChange={(e) => setReqAsset(e.target.value)}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors appearance-none shadow-inner cursor-pointer"
                    >
                      <option value="" disabled>Select from database...</option>
                      {items.map(i => (
                        <option key={i.id} value={i.name}>
                          {i.name}
                        </option>
                      ))}
                      <option value="OTHER">Other (Add New Asset)...</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-secondary)]">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                  </div>

                  <AnimatePresence>
                    {reqAsset === 'OTHER' && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <input 
                          type="text" 
                          required
                          placeholder="Enter new asset name..." 
                          value={customAsset}
                          onChange={(e) => setCustomAsset(e.target.value)}
                          className="mt-3 w-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors shadow-inner"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-widest flex justify-between">
                    <span>Requested Quantity</span>
                    {derivedUnit && <span className="text-[var(--accent-primary)]">({derivedUnit.toUpperCase()})</span>}
                  </label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={reqQty}
                    onChange={(e) => setReqQty(e.target.value)}
                    placeholder="Enter amount..."
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--accent-primary)] transition-colors shadow-inner"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-widest">
                    Priority Level
                  </label>
                  <div className="flex gap-4">
                    <button 
                      type="button" 
                      onClick={() => setReqUrgency('ROUTINE')}
                      className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all duration-300 ${
                        reqUrgency === 'ROUTINE' 
                          ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                          : 'bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]'
                      }`}
                    >
                      ROUTINE
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setReqUrgency('CRITICAL')}
                      className={`flex-1 py-3 rounded-lg text-sm font-bold border transition-all duration-300 ${
                        reqUrgency === 'CRITICAL' 
                          ? 'bg-[var(--critical)] text-white border-[var(--critical)] shadow-[0_0_15px_rgba(225,29,72,0.3)]' 
                          : 'bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--critical)] hover:bg-[var(--critical)]/10 hover:border-[var(--critical)]/50'
                      }`}
                    >
                      CRITICAL
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-2 pt-5 border-t border-[var(--border)] flex justify-end items-center gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)} 
                    className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={syncState !== 'IDLE'}
                    className={`px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-[var(--shadow-glass)] disabled:opacity-80 min-w-[200px] flex justify-center items-center ${
                      syncState === 'QUEUED' 
                        ? 'bg-[var(--ok)] text-white' 
                        : 'bg-gradient-to-b from-[var(--accent-primary)] to-blue-600 hover:from-blue-400 hover:to-[var(--accent-primary)] text-white border border-blue-400/30'
                    }`}
                  >
                    {syncState === 'IDLE' ? 'Transmit Requisition' : (syncState === 'SYNCING' ? 'SYNCING...' : 'QUEUED')}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────
          MODAL: Add New Local Item
          ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isAddItemModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="w-full max-w-lg bg-[var(--bg-panel-raised)] border border-[var(--border)] rounded-2xl shadow-2xl overflow-hidden font-['Work_Sans'] relative"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-panel)] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--ok)]/10 to-transparent pointer-events-none"></div>
                <h2 className="text-lg font-bold text-[var(--ok)] font-['Space_Grotesk'] tracking-wide relative z-10">
                  Add Local Inventory Item
                </h2>
                <button 
                  onClick={() => setIsAddItemModalOpen(false)} 
                  className="text-[var(--text-secondary)] hover:text-[var(--critical)] transition-colors relative z-10"
                >
                  <X size={20}/>
                </button>
              </div>
              
              {/* Modal Body */}
              <form onSubmit={handleAddItemSubmit} className="p-6 flex flex-col gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-widest">
                    Item Name
                  </label>
                  <input 
                    type="text" 
                    required
                    value={newItemData.name}
                    onChange={(e) => setNewItemData({...newItemData, name: e.target.value})}
                    placeholder="e.g. Spare Battery Pack"
                    className="w-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--ok)] transition-colors shadow-inner"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-widest">
                      Category
                    </label>
                    <select 
                      value={newItemData.category}
                      onChange={(e) => setNewItemData({...newItemData, category: e.target.value})}
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--ok)] transition-colors appearance-none shadow-inner cursor-pointer"
                    >
                      <option value="FUEL">FUEL</option>
                      <option value="MEDICAL">MEDICAL</option>
                      <option value="TECHNICAL SPARES">TECHNICAL SPARES</option>
                      <option value="PERISHABLES">PERISHABLES</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-widest">
                      Unit
                    </label>
                    <input 
                      type="text" 
                      required
                      value={newItemData.unit}
                      onChange={(e) => setNewItemData({...newItemData, unit: e.target.value})}
                      placeholder="e.g. Liters, Units"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--ok)] transition-colors shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-widest">
                      Initial Quantity
                    </label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      value={newItemData.qty}
                      onChange={(e) => setNewItemData({...newItemData, qty: e.target.value})}
                      placeholder="Enter amount..."
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--ok)] transition-colors shadow-inner"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] mb-2 uppercase tracking-widest">
                      Shelf Number
                    </label>
                    <input 
                      type="text" 
                      value={newItemData.shelfNumber}
                      onChange={(e) => setNewItemData({...newItemData, shelfNumber: e.target.value})}
                      placeholder="e.g. TNK-04"
                      className="w-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-primary)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--ok)] transition-colors shadow-inner"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-2 pt-5 border-t border-[var(--border)] flex justify-end items-center gap-4">
                  <button 
                    type="button" 
                    onClick={() => setIsAddItemModalOpen(false)} 
                    className="text-sm font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-3 rounded-lg font-bold text-sm transition-all shadow-[var(--shadow-glass)] bg-gradient-to-b from-[var(--ok)] to-green-600 hover:from-green-500 hover:to-[var(--ok)] text-white border border-green-400/30"
                  >
                    Add Item
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────────────────────────────────────────────────
          MODAL: Confirm Delete Item
          ────────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isDeleteModalOpen && itemToDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[var(--bg-panel-raised)] border border-[var(--critical)]/50 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col relative font-['Work_Sans']"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-[var(--critical)]" />
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4 text-[var(--critical)]">
                  <AlertTriangle size={24} />
                  <h3 className="text-lg font-bold font-['Space_Grotesk']">Confirm Deletion</h3>
                </div>
                <p className="text-[var(--text-secondary)] text-sm mb-4">
                  You are about to remove <strong className="text-[var(--text-primary)]">{itemToDelete.name}</strong> from the inventory. This action cannot be undone.
                </p>
                <p className="text-[var(--text-primary)] text-sm mb-2 font-medium">
                  Please type <strong className="text-[var(--critical)]">REMOVE</strong> to confirm:
                </p>
                <form onSubmit={handleConfirmDelete}>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type 'REMOVE' here"
                    className="w-full bg-[var(--bg-panel)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--critical)] transition-colors mb-6"
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsDeleteModalOpen(false);
                        setDeleteConfirmText('');
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={deleteConfirmText !== 'REMOVE'}
                      className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--critical)] text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_var(--critical)] shadow-opacity-50"
                    >
                      Confirm Removal
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
