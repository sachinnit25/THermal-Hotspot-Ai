import React from 'react';
import {
  Bell,
  Volume2,
  VolumeX,
  Key,
  Upload,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

interface TacticalTopNavProps {
  activePill: 'area' | 'map' | 'routes' | 'weather' | 'analytics' | 'firms';
  onSelectPill: (pill: 'area' | 'map' | 'routes' | 'weather' | 'analytics' | 'firms') => void;
  activeAlertCount: number;
  onOpenAlerts: () => void;
  onOpenApiKeys: () => void;
  onOpenCsvImport: () => void;
  onSimulatePass: () => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const TacticalTopNav: React.FC<TacticalTopNavProps> = ({
  activePill,
  onSelectPill,
  activeAlertCount,
  onOpenAlerts,
  onOpenApiKeys,
  onOpenCsvImport,
  onSimulatePass,
  onRefresh,
  isRefreshing,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <header className="relative z-30 flex flex-col gap-4 border-b border-[#1B2935] bg-[#05080D]/90 px-4 py-3 sm:px-6 backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">

      {/* BRAND IDENTITY */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#38BDF8] text-[#05080D] shadow-[0_0_24px_rgba(56,189,248,0.25)]">
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>

        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            THERMALGUARD
            <span className="text-[#38BDF8] font-mono text-base font-black">AI</span>
            <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-[#0B1118] text-slate-300 border border-[#1B2935] font-bold">
              HAZARD INTELLIGENCE
            </span>
          </h1>
        </div>
      </div>

      {/* CENTER NAVIGATION */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-[#1B2935] bg-[#0B1118]/90 p-1.5 backdrop-blur-xl">
        <button
          onClick={() => onSelectPill('area')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activePill === 'area'
              ? 'bg-[#38BDF8] text-[#05080D] font-bold shadow-[0_0_12px_rgba(56,189,248,0.18)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Area
        </button>

        <button
          onClick={() => onSelectPill('map')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activePill === 'map'
              ? 'bg-[#38BDF8] text-[#05080D] font-bold shadow-[0_0_12px_rgba(56,189,248,0.18)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Map
        </button>

        <button
          onClick={() => onSelectPill('routes')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activePill === 'routes'
              ? 'bg-[#38BDF8] text-[#05080D] font-bold shadow-[0_0_12px_rgba(56,189,248,0.18)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Routes
        </button>

        <button
          onClick={() => onSelectPill('weather')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activePill === 'weather'
              ? 'bg-[#38BDF8] text-[#05080D] font-bold shadow-[0_0_12px_rgba(56,189,248,0.18)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Weather
        </button>

        <button
          onClick={() => onSelectPill('analytics')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activePill === 'analytics'
              ? 'bg-[#38BDF8] text-[#05080D] font-bold shadow-[0_0_12px_rgba(56,189,248,0.18)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Analytics
        </button>

        <button
          onClick={() => onSelectPill('firms')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activePill === 'firms'
              ? 'bg-[#38BDF8] text-[#05080D] font-bold shadow-[0_0_12px_rgba(56,189,248,0.18)]'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          FIRMS Feed
        </button>
      </div>

      {/* TOP RIGHT ACTION CONTROLS */}
      <div className="flex items-center gap-2 text-xs">

        {/* Simulate Anomaly */}
        <button
          onClick={onSimulatePass}
          className="flex items-center gap-1.5 rounded-full border border-[#FF8A00]/40 bg-[#FF8A00]/10 px-4 py-2 text-xs font-semibold text-[#FFB347] hover:bg-[#FF8A00]/20 hover:border-[#FF8A00]/60 transition-all"
          title="Simulate thermal anomaly detection"
        >
          <Sparkles size={13} className="text-[#FF8A00]" />
          <span>Simulate Anomaly</span>
        </button>

        {/* CSV Import — FIX: was declared in props but had no UI trigger */}
        <button
          onClick={onOpenCsvImport}
          className="flex items-center gap-1.5 rounded-full border border-[#1B2935] bg-[#0B1118]/90 px-3 py-2 text-slate-300 hover:border-[#38BDF8]/40 hover:bg-[#38BDF8]/10 hover:text-[#38BDF8] transition-colors"
          title="Import hotspots from CSV"
        >
          <Upload size={14} />
        </button>

        {/* Refresh */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-full border border-[#1B2935] bg-[#0B1118]/90 p-2 text-slate-300 hover:border-[#38BDF8]/40 hover:bg-[#38BDF8]/10 hover:text-[#38BDF8] transition-colors"
          title="Refresh telemetry"
        >
          <RefreshCw
            size={14}
            className={isRefreshing ? 'animate-spin text-[#38BDF8]' : ''}
          />
        </button>

        {/* Audio Siren Toggle */}
        <button
          onClick={onToggleSound}
          className={`rounded-full border p-2 transition-colors ${
            soundEnabled
              ? 'border-[#38BDF8]/50 bg-[#38BDF8]/10 text-[#38BDF8] shadow-[0_0_12px_rgba(56,189,248,0.12)]'
              : 'border-[#1B2935] bg-[#0B1118]/90 text-slate-500 hover:text-white'
          }`}
          title={soundEnabled ? 'Siren Audio Active' : 'Siren Audio Muted'}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className={`relative rounded-full border p-2 transition-all ${
            activeAlertCount > 0
              ? 'border-[#FF3B30]/50 bg-[#FF3B30]/15 text-[#FF6B63] shadow-[0_0_15px_rgba(255,59,48,0.2)]'
              : 'border-[#1B2935] bg-[#0B1118]/90 text-slate-400 hover:text-white'
          }`}
          title="Incident Alerts"
        >
          <Bell
            size={14}
            className={activeAlertCount > 0 ? 'animate-bounce' : ''}
          />
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF3B30] px-1 text-[9px] font-bold text-white shadow-[0_0_8px_rgba(255,59,48,0.4)]">
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* API Keys Configuration */}
        <button
          onClick={onOpenApiKeys}
          className="rounded-full border border-[#1B2935] bg-[#0B1118]/90 p-2 text-slate-400 hover:border-[#38BDF8]/40 hover:bg-[#38BDF8]/10 hover:text-[#38BDF8] transition-colors"
          title="NASA FIRMS & Gemini API Keys"
        >
          <Key size={14} />
        </button>
      </div>
    </header>
  );
};