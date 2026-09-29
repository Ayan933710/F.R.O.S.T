import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CloudRain,
  Gauge,
  MapPin,
  ShieldCheck,
  Thermometer,
  Users,
  Wind,
  Zap,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';

function StationCard({ station, isSelected, onSelect }) {
  const isCold = station.temp < -35;
  return (
    <button
      type="button"
      onClick={() => onSelect(station.id)}
      className={`w-full text-left bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border rounded-lg p-4 flex flex-col gap-3 transition-all duration-300 ease-out cursor-pointer ${
        isSelected
          ? 'border-[var(--accent-primary)] shadow-[0_0_20px_rgba(59,130,246,0.15)] -translate-y-0.5'
          : 'border-[var(--border)] hover:border-[var(--accent-primary)] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] hover:-translate-y-0.5'
      }`}
    >
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
    </button>
  );
}

function DetailPanel({ station, onBack }) {
  const [liveWeather, setLiveWeather] = useState(null);

  useEffect(() => {
    let active = true;
    const loadWeather = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/v1/aws/current?station=${station.id}`);
        const data = await response.json();
        if (response.ok && active) setLiveWeather(data);
      } catch (e) {}
    };
    loadWeather();
    const interval = setInterval(loadWeather, 15000);
    return () => { active = false; clearInterval(interval); };
  }, [station.id]);

  if (!station) return null;

  return (
    <div className="bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-5">
      <button onClick={onBack} className="mb-4 flex items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-colors">
        <ArrowLeft size={16} /> Back to centers
      </button>
      <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <p className="text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.2em]">Selected center</p>
          <h3 className="mt-2 text-[var(--text-primary)] font-['Space_Grotesk'] text-2xl font-bold">{station.name}</h3>
          <p className="mt-1 text-[var(--text-secondary)] text-sm">{station.region}</p>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[var(--ok)] text-xs font-semibold">
            <Activity size={12} />
            {station.status}
          </div>
          <p className="mt-2 text-[var(--text-secondary)] text-xs">Lead: {station.leader}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-5">
        <div className="space-y-5">


          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-4">
            <div className="flex items-center gap-2 text-[var(--accent-primary)] font-semibold text-sm uppercase tracking-[0.12em]">
              <Users size={15} />
              Active rosters
            </div>
            <div className="mt-4 space-y-2.5">
              {station.rosters?.map((member) => (
                <div key={member.name} className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--bg-panel-raised)] px-3 py-2">
                  <div>
                    <p className="text-[var(--text-primary)] text-sm font-medium">{member.name}</p>
                    <p className="text-[var(--text-secondary)] text-xs">{member.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[var(--text-secondary)] text-[10px] uppercase tracking-[0.12em]">{member.shift}</p>
                    <p className="text-[var(--ok)] text-xs font-medium">{member.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-4">
            <div className="flex items-center gap-2 text-[var(--accent-primary)] font-semibold text-sm uppercase tracking-[0.12em]">
              <CloudRain size={15} />
              Current weather
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] text-xs">Temp</span>
                <span className="text-[var(--text-primary)] text-sm font-medium">{liveWeather?.temperature?.toFixed(1) || station.temp}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] text-xs">Wind</span>
                <span className="text-[var(--text-primary)] text-sm font-medium">{liveWeather?.wind_kmh?.toFixed(0) || station.weather?.wind} km/h</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] text-xs">Humidity</span>
                <span className="text-[var(--text-primary)] text-sm font-medium">{liveWeather?.humidity?.toFixed(0) || station.weather?.humidity}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] text-xs">Visibility</span>
                <span className="text-[var(--text-primary)] text-sm font-medium">{liveWeather?.visibility_km?.toFixed(1) || station.weather?.visibility} km</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)] text-xs">Pressure</span>
                <span className="text-[var(--text-primary)] text-sm font-medium">{liveWeather?.pressure_hpa?.toFixed(0) || station.weather?.pressure} hPa</span>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--bg-panel-raised)] px-3 py-2">
              <span className="flex items-center gap-2 text-[var(--text-secondary)] text-xs"><Wind size={12} /> Live API Link</span>
              <span className="text-[var(--ok)] font-semibold">{liveWeather ? 'Connected' : 'Connecting...'}</span>
            </div>
          </div>

          <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-panel)] p-4">
            <div className="flex items-center gap-2 text-[var(--accent-primary)] font-semibold text-sm uppercase tracking-[0.12em]">
              <Gauge size={15} />
              Site logistics
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Battery reserve</span>
                <span className="text-[var(--text-primary)] font-medium">{station.logistics?.batteryReserve}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Sensor health</span>
                <span className="text-[var(--text-primary)] font-medium">{station.logistics?.sensorHealth}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Next maintenance</span>
                <span className="text-[var(--text-primary)] font-medium text-right">{station.logistics?.nextMaintenance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--text-secondary)]">Runway status</span>
                <span className="text-[var(--text-primary)] font-medium">{station.logistics?.runwayStatus}</span>
              </div>
            </div>
          </div>


        </div>
      </div>
    </div>
  );
}

export default function ResearchCenters() {
  const [stations, setStations] = useState([]);
  const [selectedStationId, setSelectedStationId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCenters = async () => {
      try {
        const res = await fetch(`${API_BASE}/research-centers`);
        const data = await res.json();
        setStations(data);
      } catch (error) {
        console.error('Failed to load research centers', error);
      } finally {
        setLoading(false);
      }
    };

    loadCenters();
  }, []);

  const selectedStation = stations.find((station) => station.id === selectedStationId);

  return (
    <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-6 h-full flex flex-col overflow-y-auto">
      <h2 className="text-[var(--accent-primary)] font-['Space_Grotesk'] font-bold text-2xl mb-6 tracking-wide">
        RESEARCH CENTERS
      </h2>

      {loading ? (
        <div className="text-[var(--text-secondary)] text-sm">Loading centers…</div>
      ) : (
        <AnimatePresence mode="wait">
          {selectedStation ? (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <DetailPanel station={selectedStation} onBack={() => setSelectedStationId(null)} />
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0, x: -20, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.98 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {stations.map((station) => (
                  <StationCard
                    key={station.id}
                    station={station}
                    isSelected={false}
                    onSelect={setSelectedStationId}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
