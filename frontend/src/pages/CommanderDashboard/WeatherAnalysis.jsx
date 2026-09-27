import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Thermometer, Eye, Wind } from 'lucide-react';

const mockWeatherData = [
 { day: 'Mon', wind: 85 },
 { day: 'Tue', wind: 92 },
 { day: 'Wed', wind: 78 },
 { day: 'Thu', wind: 65 },
 { day: 'Fri', wind: 88 },
 { day: 'Sat', wind: 105 },
 { day: 'Sun', wind: 95 },
];

export default function WeatherAnalysis() {
 return (
  <div className="bg-[var(--bg-panel)] backdrop-blur-xl shadow-[var(--shadow-glass)] border border-[var(--border)] rounded-xl p-6 min-h-full flex flex-col">
   <h2 className="text-[var(--accent-primary)] font-['Space_Grotesk'] font-bold text-2xl mb-6 tracking-wide">WEATHER ANALYSIS</h2>

   {/* Current Stats */}
   <div className="flex gap-4 mb-8 text-[var(--text-primary)] font-['Work_Sans']">
    <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] p-4 rounded-lg border border-[var(--border)]">
     <div className="flex items-center gap-2 mb-2">
      <Thermometer size={18} className="text-[var(--accent-primary)]" />
      <span className="text-[var(--text-secondary)]">Temp</span>
     </div>
     <span className="text-[var(--accent-primary)] font-bold text-2xl">-45°C</span>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] p-4 rounded-lg border border-[var(--border)]">
     <div className="flex items-center gap-2 mb-2">
      <Eye size={18} className="text-[var(--accent-primary)]" />
      <span className="text-[var(--text-secondary)]">Visibility</span>
     </div>
     <span className="text-[var(--accent-primary)] font-bold text-2xl">1.2km</span>
    </div>

    <div className="flex-1 flex flex-col items-center justify-center bg-[var(--bg-panel-raised)] backdrop-blur-xl shadow-[var(--shadow-glass)] p-4 rounded-lg border border-[var(--border)]">
     <div className="flex items-center gap-2 mb-2">
      <Wind size={18} className="text-[var(--critical)]" />
      <span className="text-[var(--text-secondary)]">Wind</span>
     </div>
     <span className="text-[var(--critical)] font-bold text-2xl">85 km/h</span>
    </div>
   </div>

   {/* 7-Day Forecast Graph */}
   <h3 className="text-[var(--text-secondary)] font-bold text-sm mb-4 uppercase tracking-wider">7-Day Wind Speed Forecast (km/h)</h3>
   <div className="flex-1 w-full mt-2">
    <ResponsiveContainer width="100%" height={300}>
     <AreaChart data={mockWeatherData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
      <defs>
       <linearGradient id="colorWind" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="var(--accent-primary)" stopOpacity={0.3} />
        <stop offset="95%" stopColor="var(--accent-primary)" stopOpacity={0} />
       </linearGradient>
      </defs>
      <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
      <XAxis dataKey="day" stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} dy={10} />
      <YAxis stroke="var(--text-secondary)" tick={{ fill: 'var(--text-secondary)' }} tickLine={false} axisLine={false} />
      <Tooltip
       contentStyle={{ backgroundColor: 'var(--bg-panel-raised)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-primary)' }}
       itemStyle={{ fontWeight: 'bold' }}
      />
      <Area type="monotone" dataKey="wind" stroke="var(--accent-primary)" fillOpacity={1} fill="url(#colorWind)" strokeWidth={2} />
     </AreaChart>
    </ResponsiveContainer>
   </div>
  </div>
 );
}