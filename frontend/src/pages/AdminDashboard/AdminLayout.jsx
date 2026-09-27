import { NavLink, Routes, Route } from 'react-router-dom';
import { Building2, Compass, Ship, PackageSearch, History } from 'lucide-react';
import NavigationBar from '../../components/Shared/NavigationBar';
import ResearchCenters from './ResearchCenters';
import ExpeditionPlanner from './ExpeditionPlanner';
import GlobalCargoTracker from './GlobalCargoTracker';
import InventoryRequests from './Inventory';
import AdminHistory from './AdminHistory';

const sidebarLinks = [
 { to: '/admin',      label: 'Research Centers',  icon: Building2,   end: true },
 { to: '/admin/expedition', label: 'Expedition Planner', icon: Compass },
 { to: '/admin/cargo',   label: 'Global Cargo',    icon: Ship },
 { to: '/admin/inventory', label: 'Inventory',     icon: PackageSearch },
 { to: '/admin/history',  label: 'Admin History',   icon: History },
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

export default function AdminLayout() {
 return (
  <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col w-full overflow-x-hidden">
   <NavigationBar />

   <div className="flex flex-1 h-[calc(100vh-73px)] w-full overflow-x-hidden">
    {/* Left Sidebar */}
    <aside className="w-64 bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border-r border-[var(--border)] flex flex-col p-4 gap-2 shrink-0">
     <h3 className="text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-widest px-4 mb-2">
      Admin Modules
     </h3>
     {sidebarLinks.map((link) => (
      <SidebarLink key={link.to} {...link} />
     ))}
    </aside>

    {/* Dynamic Main Content */}
    <main className="flex-1 p-6 overflow-y-auto bg-[var(--bg-primary)] min-w-0">
     <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-6 min-h-full min-w-0">
      <Routes>
       <Route index element={<ResearchCenters />} />
       <Route path="expedition" element={<ExpeditionPlanner />} />
       <Route path="cargo" element={<GlobalCargoTracker />} />
       <Route path="inventory" element={<InventoryRequests />} />
       <Route path="history" element={<AdminHistory />} />
      </Routes>
     </div>
    </main>
   </div>
  </div>
 );
}