import { Clock, Zap, PackageCheck, Radio, Thermometer, Shield, AlertTriangle } from 'lucide-react';

const historyEntries = [
 { time: '09:15', action: 'Transmitted CRITICAL requisition for 500x Aviation Turbine Fuel (ATF) via SATCOM uplink.', icon: Radio, severity: 'warning' },
 { time: '08:47', action: 'Received Admin approval for 12x Seismic Sensors. Inbound dispatch logged.', icon: Shield, severity: 'normal' },
 { time: '08:00', action: 'Adjusted local inventory count via Edge Node: Aviation Turbine Fuel (ATF) [-50 Liters].', icon: Zap, severity: 'warning' },
 { time: '07:30', action: 'Successfully verified inbound Cargo Manifest (Hash: 0x9f8b7e2c) at Bay 3-Alpha.', icon: PackageCheck, severity: 'normal' },
 { time: '07:12', action: 'Inventory sync completed.', icon: Shield, severity: 'normal' },
 { time: '06:45', action: 'Adjusted local inventory count via Edge Node: Epinephrine [+10 Vials].', icon: Zap, severity: 'normal' },
 { time: '06:00', action: 'Satellite Link severed (Blackout Window). Store & Forward queue activated.', icon: AlertTriangle, severity: 'critical' },
];

const severityColors = {
 normal:  'text-[var(--ok)]',
 warning: 'text-[var(--accent-primary)]',
 critical: 'text-[var(--critical)]',
};

const severityBorder = {
 normal:  'border-[var(--ok)]',
 warning: 'border-[var(--accent-primary)]',
 critical: 'border-[var(--critical)]',
};

export default function CommanderHistory() {
 return (
  <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-6 min-h-full flex flex-col">
   <h2 className="text-[var(--accent-primary)] font-['Space_Grotesk'] font-bold text-2xl tracking-wide mb-2">
    COMMANDER HISTORY
   </h2>
   <p className="text-[var(--text-secondary)] text-sm mb-6 font-['Work_Sans']">
    Today's command log • {historyEntries.length} actions recorded
   </p>

   {/* Timeline */}
   <div className="flex-1 overflow-y-auto space-y-0">
    {historyEntries.map((entry, i) => {
     const Icon = entry.icon;
     return (
      <div
       key={i}
       className={`flex items-start gap-4 border-l-2 ${severityBorder[entry.severity]} pl-4 py-4 hover:bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] transition-colors rounded-r-lg`}
      >
       <div className={`mt-0.5 ${severityColors[entry.severity]}`}>
        <Icon size={18} />
       </div>
       <div className="flex-1 min-w-0">
        <p className="text-[var(--text-primary)] text-sm font-medium leading-snug">
         {entry.action}
        </p>
       </div>
       <div className="flex items-center gap-1.5 text-[var(--text-secondary)] text-xs font-mono whitespace-nowrap shrink-0">
        <Clock size={12} />
        {entry.time}
       </div>
      </div>
     );
    })}
   </div>
  </div>
 );
}
