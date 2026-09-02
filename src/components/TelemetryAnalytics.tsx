import React from 'react';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  BarChart3, 
  PieChart as PieIcon, 
  TrendingUp, 
  Flame, 
  ShieldAlert, 
  Sparkles,
  Layers
} from 'lucide-react';
import { Hotspot, HotspotClass, DashboardMetrics } from '../types/hotspot';

interface TelemetryAnalyticsProps {
  hotspots: Hotspot[];
  metrics: DashboardMetrics;
}

const CLASS_COLORS: Record<HotspotClass, string> = {
  industrial: '#13c8ff',
  wildfire: '#ff4b72',
  agricultural: '#ffb020',
  gas_flare: '#8c52ff',
  mining: '#10e796',
  unknown: '#94a3b8',
};

export const TelemetryAnalytics: React.FC<TelemetryAnalyticsProps> = ({
  hotspots,
  metrics,
}) => {
  // Classification Pie Data
  const pieData = Object.entries(metrics.classCounts).map(([cls, count]) => ({
    name: cls.replace('_', ' ').toUpperCase(),
    value: count,
    color: CLASS_COLORS[cls as HotspotClass] || '#94a3b8',
  })).filter(d => d.value > 0);

  // Risk Distribution Bar Data
  const riskData = [
    { name: 'Critical (≥0.72)', count: metrics.riskCounts.critical, fill: '#ff4b72' },
    { name: 'Elevated (0.4-0.71)', count: metrics.riskCounts.elevated, fill: '#ffb020' },
    { name: 'Watch (0.1-0.39)', count: metrics.riskCounts.watch, fill: '#13c8ff' },
    { name: 'Unassessed', count: metrics.riskCounts.unassessed, fill: '#94a3b8' },
  ];

  // Satellite Sensor Distribution
  const sensorCounts: Record<string, number> = {};
  hotspots.forEach((hs) => {
    sensorCounts[hs.source] = (sensorCounts[hs.source] || 0) + 1;
  });
  const sensorData = Object.entries(sensorCounts).map(([sensor, count]) => ({
    sensor: sensor.replace('VIIRS_', '').replace('MODIS_', ''),
    count,
  }));

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={18} className="text-cyan-400" />
            <h2 className="text-base font-bold text-white tracking-wide">
              Telemetry Analytics & Signature Distribution
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Statistical breakdown of radiometric energy, classification mix, and risk distribution.
          </p>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* 1. Classification Mix (Donut Chart) */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <PieIcon size={14} className="text-cyan-400" />
              <span>Source Signature Mix</span>
            </h3>
            <span className="font-mono text-[10px] text-slate-500">
              {hotspots.length} Total Signatures
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 flex-1">
            <div className="h-48 w-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#050816" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(5, 8, 22, 0.95)',
                      borderColor: 'rgba(88, 150, 255, 0.3)',
                      borderRadius: '8px',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend List */}
            <div className="flex-1 space-y-2 text-xs w-full">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center justify-between bg-black/20 p-2 rounded-lg border border-white/5">
                  <span className="flex items-center gap-2 text-slate-300">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    {item.name}
                  </span>
                  <span className="font-mono font-bold text-white">
                    {item.value} <span className="text-[10px] text-slate-500 font-normal">({Math.round((item.value / hotspots.length) * 100)}%)</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Risk Level Tiers (Bar Chart) */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <ShieldAlert size={14} className="text-rose-400" />
              <span>Risk Tier Distribution</span>
            </h3>
            <span className="font-mono text-[10px] text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/20">
              Escalation at 0.72
            </span>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(5, 8, 22, 0.95)',
                    borderColor: 'rgba(88, 150, 255, 0.3)',
                    borderRadius: '8px',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {riskData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Satellite Sensor Breakdown */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
            <Layers size={14} className="text-cyan-400" />
            <span>Satellite Constellation Ingestion</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sensorData.map((s) => (
              <div key={s.sensor} className="bg-space-850/60 p-3 rounded-xl border border-white/5 text-center">
                <span className="font-mono text-[10px] text-slate-400 uppercase block">{s.sensor}</span>
                <span className="mt-1 text-xl font-bold font-mono text-cyan-300 block">{s.count}</span>
                <span className="text-[10px] text-slate-500">Detections</span>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Radiative Energy Metrics */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <Flame size={14} className="text-amber-400" />
              <span>Radiometric Energy Synthesis</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-space-850/60 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Max FRP</span>
                <span className="text-xl font-bold font-mono text-amber-300">{metrics.maxFrpMW.toFixed(1)} MW</span>
                <p className="text-[10px] text-slate-500 mt-0.5">Peak combustion power</p>
              </div>
              <div className="bg-space-850/60 p-3 rounded-xl border border-white/5">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Industrial Ratio</span>
                <span className="text-xl font-bold font-mono text-cyan-300">
                  {Math.round((metrics.classCounts.industrial / (hotspots.length || 1)) * 100)}%
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5">High-confidence emitters</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
