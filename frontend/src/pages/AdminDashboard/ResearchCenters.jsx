import { Activity, Thermometer, Users, Zap, MapPin } from 'lucide-react';

const stations = [
 {
  name: 'Maitri Station',
  coords: '70°46′S, 11°44′E',
  region: 'Schirmacher Oasis, Antarctica',
  crew: 25,
  temp: -34,
  power: 96,
  status: 'Operational',
 },
 {
  name: 'Bharati Station',
  coords: '69°24′S, 76°12′E',
  region: 'Larsemann Hills, Antarctica',
  crew: 18,
  temp: -41,
  power: 92,
  status: 'Operational',
 },
 {
  name: 'Himadri Station',
  coords: '78°55′N, 11°56′E',
  region: 'Ny-Ålesund, Svalbard',
  crew: 12,
  temp: -8,
  power: 99,
  status: 'Operational',
 },
];

function StationCard({ station }) {
 const isCold = station.temp < -35;

 return (
  <div className="bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] p-4 rounded-lg flex flex-col gap-3 hover:border-[var(--accent-primary)] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer">
   {/* Header */}
   <div className="flex items-start justify-between">
    <div>
     <h3 className="tracking-wide text-[var(--text-primary)] font-semibold text-base">{station.name}</h3>
     <div className="flex items-center gap-1 mt-1">
      <MapPin size={12} className="text-[var(--text-secondary)]" />
      <span className="text-[var(--text-secondary)] text-xs">{station.coords}</span>
     </div>
     <p className="text-[var(--text-secondary)] text-xs mt-0.5">{station.region}</p>
    </div>
    <span className="text-[var(--ok)] text-xs font-semibold flex items-center gap-1">
     <Activity size={12} />
     {station.status}
    </span>
   </div>

   {/* Metrics */}
   <div className="grid grid-cols-3 gap-2 mt-1">
    <div className="text-center bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] rounded px-2 py-2 border border-[var(--border)]">
     <div className="flex items-center justify-center gap-1 mb-1">
      <Users size={12} className="text-[var(--accent-primary)]" />
      <span className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wider">Crew</span>
     </div>
     <p className="text-[var(--text-primary)] font-bold text-sm">{station.crew}</p>
    </div>
    <div className="text-center bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] rounded px-2 py-2 border border-[var(--border)]">
     <div className="flex items-center justify-center gap-1 mb-1">
      <Thermometer size={12} className={isCold ? 'text-[var(--accent-primary)]' : 'text-[var(--ok)]'} />
      <span className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wider">Temp</span>
     </div>
     <p className={`font-bold text-sm ${isCold ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'}`}>
      {station.temp}°C
     </p>
    </div>
    <div className="text-center bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] rounded px-2 py-2 border border-[var(--border)]">
     <div className="flex items-center justify-center gap-1 mb-1">
      <Zap size={12} className="text-[var(--ok)]" />
      <span className="text-[var(--text-secondary)] text-[10px] uppercase tracking-wider">Power</span>
     </div>
     <p className="text-[var(--ok)] font-bold text-sm">{station.power}%</p>
    </div>
   </div>
  </div>
 );
}

export default function ResearchCenters() {
 return (
  <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-6 h-full flex flex-col">
   <h2 className="text-[var(--accent-primary)] font-['Space_Grotesk'] font-bold text-2xl mb-6 tracking-wide">
    RESEARCH CENTERS
   </h2>

   <div className="grid grid-cols-2 gap-4 flex-1">
    {stations.map((station) => (
     <StationCard key={station.name} station={station} />
    ))}
   </div>
  </div>
 );
}
