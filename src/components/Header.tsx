import React, { useState, useEffect } from 'react';
import { 
  Telescope, 
  Database, 
  RefreshCw, 
  Bell, 
  Key, 
  Upload, 
  Download, 
  Radio, 
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onOpenAlerts: () => void;
  onOpenApiKeys: () => void;
  onOpenCsvImport: () => void;
  onSimulatePass: () => void;
  onExportData: () => void;
  activeAlertCount: number;
  totalHotspots: number;
}

export const Header: React.FC<HeaderProps> = ({
  onRefresh,
  isRefreshing,
  onOpenAlerts,
  onOpenApiKeys,
  onOpenCsvImport,
  onSimulatePass,
  onExportData,
  activeAlertCount,
  totalHotspots,
}) => {
  const [utcTime, setUtcTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setUtcTime(now.toUTCString().slice(17, 25) + ' UTC');
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="relative z-20 border-b border-cyan-500/15 bg-[#050816]/90 backdrop-blur-xl px-4 py-3.5 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-[1700px] flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        
        {/* Brand & Mission Status */}
        <div className="flex items-center gap-3.5">
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 text-cyan-300 shadow-[0_0_25px_rgba(19,200,255,0.25)]">
            <Telescope size={22} className="animate-pulse-slow" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-cyan-400/80 font-bold">
                ORBITAL TELEMETRY & AI
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-600"></span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE SENSORS
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl flex items-center gap-2">
              Thermal Hotspot AI
              <span className="text-xs px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300 font-mono font-normal">
                v2.4 Pro
              </span>
            </h1>
          </div>
        </div>

        {/* Telemetry Clock & Quick Stats */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          {/* Mission UTC Clock */}
          <div className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-700/60 bg-space-850/80 px-3 py-1.5 text-slate-300 font-mono shadow-inner">
            <Radio size={13} className="text-cyan-400 animate-pulse" />
            <span>{utcTime}</span>
          </div>

          {/* FIRMS Live Status */}
          <div className="flex items-center gap-2 rounded-lg border border-cyan-500/20 bg-cyan-950/30 px-3 py-1.5 text-cyan-300">
            <Database size={13} />
            <span className="font-medium">FIRMS Stream</span>
            <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-200">
              {totalHotspots} Detections
            </span>
          </div>

          {/* Simulate Pass Button */}
          <button
            onClick={onSimulatePass}
            className="flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-950/40 px-3 py-1.5 font-medium text-purple-200 transition-all hover:bg-purple-900/60 hover:border-purple-400 hover:text-white shadow-[0_0_15px_rgba(140,82,255,0.15)]"
            title="Simulate incoming real-time satellite overpass"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span className="hidden md:inline">Simulate Pass</span>
          </button>

          {/* Import CSV Button */}
          <button
            onClick={onOpenCsvImport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-space-850/80 px-3 py-1.5 font-medium text-slate-300 transition-colors hover:bg-space-800 hover:text-white"
            title="Upload custom NASA FIRMS CSV"
          >
            <Upload size={14} />
            <span className="hidden md:inline">Import CSV</span>
          </button>

          {/* Alert Rules & Notifications Button */}
          <button
            onClick={onOpenAlerts}
            className={`relative flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-medium transition-all ${
              activeAlertCount > 0
                ? 'border-rose-500/50 bg-rose-950/40 text-rose-200 hover:bg-rose-900/50 shadow-[0_0_15px_rgba(255,75,114,0.2)]'
                : 'border-slate-700 bg-space-850/80 text-slate-300 hover:bg-space-800 hover:text-white'
            }`}
          >
            <Bell size={14} className={activeAlertCount > 0 ? 'text-rose-400 animate-bounce' : ''} />
            <span>Alerts</span>
            {activeAlertCount > 0 && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {activeAlertCount}
              </span>
            )}
          </button>

          {/* Settings / API Key */}
          <button
            onClick={onOpenApiKeys}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-space-850/80 p-2 sm:px-3 sm:py-1.5 font-medium text-slate-300 transition-colors hover:bg-space-800 hover:text-white"
            title="Configure NASA FIRMS Key & Gemini AI"
          >
            <Key size={14} className="text-amber-400" />
            <span className="hidden lg:inline">API Config</span>
          </button>

          {/* Refresh Telemetry */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 px-3 py-1.5 font-medium text-cyan-200 transition-all hover:bg-cyan-900/60 hover:text-white"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-cyan-300' : 'text-cyan-400'} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {/* Export JSON */}
          <button
            onClick={onExportData}
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-space-850/80 p-2 text-slate-400 transition-colors hover:bg-space-800 hover:text-white"
            title="Export full intelligence dossier (JSON)"
          >
            <Download size={14} />
          </button>
        </div>

      </div>
    </header>
  );
};
