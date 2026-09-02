import React from 'react';
import { 
  CloudSun, 
  Droplets, 
  Thermometer, 
  Gauge, 
  Zap, 
  Flame, 
  MapPin, 
  Navigation,
  Wind,
  ShieldCheck,
  Radio,
  Sparkles
} from 'lucide-react';
import { DashboardMetrics, Hotspot } from '../types/hotspot';

interface WeatherAndScanPanelProps {
  metrics: DashboardMetrics;
  selectedHotspot: Hotspot | null;
}

export const WeatherAndScanPanel: React.FC<WeatherAndScanPanelProps> = ({
  metrics,
  selectedHotspot,
}) => {
  const totalCount = metrics.totalDetections || 1;
  const criticalCount = metrics.highRiskIndustrialCandidates + metrics.classCounts.wildfire;
  const fireAffectedPct = Math.min(100, Math.max(15, Math.round((criticalCount / totalCount) * 100)));
  const unAffectedPct = Math.max(0, 100 - fireAffectedPct);
  const overheatedPct = Math.min(100, Math.max(8, Math.round((metrics.classCounts.gas_flare + metrics.classCounts.industrial) / totalCount * 100)));

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Flight Altitude & Coverage Area Cards */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Flight Altitude */}
        <div className="virevo-card p-4 transition-all hover:border-white/20">
          <p className="text-[11px] font-medium text-slate-400">Flight Altitude</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">120</span>
            <span className="text-xs font-semibold text-slate-400">m</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-500 font-mono">Min Altitude: 95m</p>
        </div>

        {/* Coverage Area */}
        <div className="virevo-card p-4 transition-all hover:border-white/20">
          <p className="text-[11px] font-medium text-slate-400">Coverage Area</p>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">250</span>
            <span className="text-xs font-semibold text-slate-400">km²</span>
          </div>
          <p className="mt-2 text-[10px] text-slate-500 font-mono">Distance: 200 km</p>
        </div>
      </div>

      {/* 2. Today's Weather Card */}
      <div className="virevo-card p-4 sm:p-5 space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudSun size={16} className="text-[#FFB703]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Todays Weather
            </h3>
          </div>
          <span className="font-mono text-[9px] uppercase px-2.5 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
            SURFACE METAR
          </span>
        </div>

        {/* 4-Grid Weather Specs */}
        <div className="grid grid-cols-2 gap-3">
          {/* Rainfall */}
          <div className="rounded-2xl border border-white/5 bg-obsidian-900/60 p-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Droplets size={13} className="text-cyan-400" />
              <span className="text-[10px] uppercase font-mono">Rainfall</span>
            </div>
            <p className="mt-1.5 text-sm font-bold font-mono text-white">50mm</p>
          </div>

          {/* Temperature */}
          <div className="rounded-2xl border border-white/5 bg-obsidian-900/60 p-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Thermometer size={13} className="text-[#FF5722]" />
              <span className="text-[10px] uppercase font-mono">Temperature</span>
            </div>
            <p className="mt-1.5 text-sm font-bold font-mono text-white">28°C</p>
          </div>

          {/* Humidity */}
          <div className="rounded-2xl border border-white/5 bg-obsidian-900/60 p-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Gauge size={13} className="text-purple-400" />
              <span className="text-[10px] uppercase font-mono">Humidity</span>
            </div>
            <p className="mt-1.5 text-sm font-bold font-mono text-white">32%</p>
          </div>

          {/* Storm Level */}
          <div className="rounded-2xl border border-white/5 bg-obsidian-900/60 p-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Zap size={13} className="text-[#FF007A]" />
              <span className="text-[10px] uppercase font-mono">Storm Level</span>
            </div>
            <p className="mt-1.5 text-sm font-bold font-mono text-[#FF2A6D]">1 / 10</p>
          </div>
        </div>
      </div>

      {/* 3. Fire Analytics Card with Gradient Progress Bars */}
      <div className="virevo-card p-4 sm:p-5 space-y-4 flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-[#FF5722]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Fire Analytics
            </h3>
          </div>
          <span className="font-mono text-[9px] uppercase font-bold text-white bg-virevo-gradient px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(255,0,122,0.35)]">
            {metrics.totalDetections} NODES
          </span>
        </div>

        {/* Multi-tiered glowing gradient progress bars */}
        <div className="space-y-3.5 text-xs">
          {/* 1. Total Jungle Area Scanned */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Total Area Scanned</span>
              <span className="font-mono font-bold text-white">100%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-slate-600 to-slate-400 w-full" />
            </div>
          </div>

          {/* 2. Fire-Affected Area (Magenta to Coral Gradient) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white font-medium">Fire-Affected Area</span>
              <span className="font-mono font-bold text-[#FF2A6D]">{fireAffectedPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full gradient-bar-fill-1 transition-all duration-700" 
                style={{ width: `${fireAffectedPct}%` }}
              />
            </div>
          </div>

          {/* 3. Unaffected Area (Purple to Coral Gradient) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Unaffected Protected Area</span>
              <span className="font-mono font-bold text-purple-300">{unAffectedPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full gradient-bar-fill-2 transition-all duration-700" 
                style={{ width: `${unAffectedPct}%` }}
              />
            </div>
          </div>

          {/* 4. Over Heated Area (Coral to Amber Gradient) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Over Heated Core Zone</span>
              <span className="font-mono font-bold text-[#FFB703]">{overheatedPct}%</span>
            </div>
            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div 
                className="h-full rounded-full gradient-bar-fill-3 transition-all duration-700" 
                style={{ width: `${overheatedPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
