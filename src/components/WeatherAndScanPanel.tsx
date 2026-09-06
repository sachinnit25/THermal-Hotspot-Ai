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
        <div className="virevo-card p-4 transition-all hover:border-[#38BDF8]/30">
          <p className="text-[11px] font-medium text-slate-400">
            Flight Altitude
          </p>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              120
            </span>
            <span className="text-xs font-semibold text-slate-400">
              m
            </span>
          </div>

          <p className="mt-2 text-[10px] text-slate-500 font-mono">
            Min Altitude: 95m
          </p>
        </div>

        {/* Coverage Area */}
        <div className="virevo-card p-4 transition-all hover:border-[#38BDF8]/30">
          <p className="text-[11px] font-medium text-slate-400">
            Coverage Area
          </p>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
              250
            </span>
            <span className="text-xs font-semibold text-slate-400">
              km²
            </span>
          </div>

          <p className="mt-2 text-[10px] text-slate-500 font-mono">
            Distance: 200 km
          </p>
        </div>

      </div>

      {/* 2. Today's Weather Card */}
      <div className="virevo-card p-4 sm:p-5 space-y-3.5">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudSun size={16} className="text-[#FF8A00]" />

            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Todays Weather
            </h3>
          </div>

          <span className="font-mono text-[9px] uppercase px-2.5 py-0.5 rounded-full bg-[#0B1118] text-slate-400 border border-[#1B2935]">
            SURFACE METAR
          </span>
        </div>

        {/* 4-Grid Weather Specs */}
        <div className="grid grid-cols-2 gap-3">

          {/* Rainfall */}
          <div className="rounded-2xl border border-[#1B2935] bg-[#0B1118]/70 p-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Droplets size={13} className="text-[#38BDF8]" />
              <span className="text-[10px] uppercase font-mono">
                Rainfall
              </span>
            </div>

            <p className="mt-1.5 text-sm font-bold font-mono text-white">
              50mm
            </p>
          </div>

          {/* Temperature */}
          <div className="rounded-2xl border border-[#1B2935] bg-[#0B1118]/70 p-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Thermometer size={13} className="text-[#FF8A00]" />
              <span className="text-[10px] uppercase font-mono">
                Temperature
              </span>
            </div>

            <p className="mt-1.5 text-sm font-bold font-mono text-white">
              28°C
            </p>
          </div>

          {/* Humidity */}
          <div className="rounded-2xl border border-[#1B2935] bg-[#0B1118]/70 p-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Gauge size={13} className="text-[#38BDF8]" />
              <span className="text-[10px] uppercase font-mono">
                Humidity
              </span>
            </div>

            <p className="mt-1.5 text-sm font-bold font-mono text-white">
              32%
            </p>
          </div>

          {/* Storm Level */}
          <div className="rounded-2xl border border-[#1B2935] bg-[#0B1118]/70 p-3">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Zap size={13} className="text-[#FF3B30]" />

              <span className="text-[10px] uppercase font-mono">
                Storm Level
              </span>
            </div>

            <p className="mt-1.5 text-sm font-bold font-mono text-[#FF6B63]">
              1 / 10
            </p>
          </div>

        </div>
      </div>

      {/* 3. Fire Analytics Card */}
      <div className="virevo-card p-4 sm:p-5 space-y-4 flex-1">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-[#FF8A00]" />

            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Fire Analytics
            </h3>
          </div>

          <span className="font-mono text-[9px] uppercase font-bold text-[#FFB347] bg-[#FF8A00]/10 border border-[#FF8A00]/30 px-2.5 py-0.5 rounded-full">
            {metrics.totalDetections} NODES
          </span>
        </div>

        {/* Thermal Monitoring Progress Bars */}
        <div className="space-y-3.5 text-xs">

          {/* 1. Total Area Scanned */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                Total Area Scanned
              </span>

              <span className="font-mono font-bold text-white">
                100%
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full rounded-full bg-slate-500 w-full" />
            </div>
          </div>

          {/* 2. Fire-Affected Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white font-medium">
                Fire-Affected Area
              </span>

              <span className="font-mono font-bold text-[#FF6B63]">
                {fireAffectedPct}%
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#FF3B30] transition-all duration-700 shadow-[0_0_8px_rgba(255,59,48,0.3)]"
                style={{ width: `${fireAffectedPct}%` }}
              />
            </div>
          </div>

          {/* 3. Unaffected Protected Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                Unaffected Protected Area
              </span>

              <span className="font-mono font-bold text-[#22C55E]">
                {unAffectedPct}%
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#22C55E] transition-all duration-700 shadow-[0_0_8px_rgba(34,197,94,0.2)]"
                style={{ width: `${unAffectedPct}%` }}
              />
            </div>
          </div>

          {/* 4. Overheated Core Zone */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">
                Over Heated Core Zone
              </span>

              <span className="font-mono font-bold text-[#FF8A00]">
                {overheatedPct}%
              </span>
            </div>

            <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#FF8A00] transition-all duration-700 shadow-[0_0_8px_rgba(255,138,0,0.3)]"
                style={{ width: `${overheatedPct}%` }}
              />
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};