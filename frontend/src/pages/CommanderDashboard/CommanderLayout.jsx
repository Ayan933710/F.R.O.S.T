import { useState } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import { Radar, Cloud, Package, Scan, Users, History, AlertTriangle } from 'lucide-react';
import NavigationBar from '../../components/Shared/NavigationBar';
import LiveTelemetryRadar from './LiveTelemetryRadar';
import WeatherAnalysis from './WeatherAnalysis';
import OfflineInventory from './Inventory';
import ArrivalCargoScanner from './ArrivalCargoScanner';
import ScientistsRoster from './ScientistsRoster';
import CommanderHistory from './CommanderHistory';
import EmergencyOverlay from './EmergencyOverlay';

const sidebarLinks = [
 { to: '/commander',      label: 'Telemetry',     icon: Radar, end: true },
 { to: '/commander/weather',  label: 'Weather',      icon: Cloud },
 { to: '/commander/inventory', label: 'Offline Inventory', icon: Package },
 { to: '/commander/cargo',   label: 'Cargo Scanner',   icon: Scan },
 { to: '/commander/roster',   label: 'Roster',      icon: Users },
 { to: '/commander/history',  label: 'History',      icon: History },
];

function SidebarLink({ to, label, icon: Icon, end }) {
 return (
  <NavLink
   to={to}
   end={end}
   className={({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors duration-200 ${
     isActive
      ? 'bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] text-[var(--accent-primary)] border-l-2 border-[var(--accent-primary)] font-semibold'
      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] hover:text-[var(--text-primary)]'
    }`
   }
  >
   <Icon size={18} />
   <span>{label}</span>
  </NavLink>
 );
}

export default function CommanderLayout() {
 const [isEmergencyActive, setIsEmergencyActive] = useState(false);

 return (
  <div className="h-screen w-full bg-[var(--bg-primary)] flex flex-col relative overflow-hidden">
   <NavigationBar />

   <div className="flex flex-1 min-h-0 overflow-hidden">
    {/* Left Sidebar */}
    <aside className="w-64 bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border-r border-[var(--border)] flex flex-col p-4 gap-2 overflow-y-auto shrink-0">
     <h3 className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-widest px-4 mb-2">
      Commander Modules
     </h3>
     {sidebarLinks.map((link) => (
      <SidebarLink key={link.to} {...link} />
     ))}

     {/* Debug Demo Trigger */}
     <button
      onClick={() => setIsEmergencyActive(true)}
      className="mt-auto flex items-center justify-center gap-2 text-[var(--critical)] text-xs border border-[var(--critical)] p-2 rounded hover:bg-[var(--critical)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
     >
      <AlertTriangle size={14} />
      Debug: Trigger LoRa SOS
     </button>
    </aside>

    {/* Dynamic Main Content */}
    <main className="flex-1 p-3 lg:p-4 overflow-y-auto bg-[var(--bg-primary)] min-w-0 flex flex-col">
     <Routes>
      <Route index element={<LiveTelemetryRadar />} />
      <Route path="telemetry" element={<Navigate to="/commander" replace />} />
      <Route path="weather" element={<WeatherAnalysis />} />
      <Route path="inventory" element={<OfflineInventory />} />
      <Route path="cargo" element={<ArrivalCargoScanner />} />
      <Route path="roster" element={<ScientistsRoster />} />
      <Route path="history" element={<CommanderHistory />} />
     </Routes>
    </main>
   </div>

   {/* Emergency Action System Overlay */}
   {isEmergencyActive && (
    <EmergencyOverlay onClose={() => setIsEmergencyActive(false)} />
   )}
  </div>
 );
}