import React from 'react';
import { 
  Bell, 
  Volume2, 
  VolumeX, 
  Grid, 
  Radio, 
  Key, 
  Upload, 
  Download, 
  RefreshCw,
  Sparkles,
  Flame,
  Layers,
  Map as MapIcon,
  Navigation,
  CloudSun,
  BarChart3,
  ExternalLink
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
    <header className="relative z-30 flex flex-col gap-4 border-b border-white/10 bg-obsidian-950/70 px-4 py-3 sm:px-6 backdrop-blur-2xl lg:flex-row lg:items-center lg:justify-between">
      {/* Brand Identity with Fluid Gradient Emblem (Matching VIREVO style) */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-virevo-gradient text-white shadow-[0_0_24px_rgba(255,0,122,0.45)]">
          {/* Tactical Drone Icon */}
          <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
        </div>

        <div>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            VIREVO <span className="text-virevo-gradient font-mono text-base font-black">AI</span>
            <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 font-bold">
              HOTSPOT PRO
            </span>
          </h1>
        </div>
      </div>

      {/* Center Navigation Pills with Gradient Glow */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-full border border-white/10 bg-obsidian-900/80 p-1.5 backdrop-blur-xl">
        <button
          onClick={() => onSelectPill('area')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activePill === 'area'
              ? 'virevo-pill-active font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Area
        </button>
        <button
          onClick={() => onSelectPill('map')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activePill === 'map'
              ? 'virevo-pill-active font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => onSelectPill('routes')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activePill === 'routes'
              ? 'virevo-pill-active font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Routes
        </button>
        <button
          onClick={() => onSelectPill('weather')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activePill === 'weather'
              ? 'virevo-pill-active font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Weather
        </button>
        <button
          onClick={() => onSelectPill('analytics')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activePill === 'analytics'
              ? 'virevo-pill-active font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => onSelectPill('firms')}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
            activePill === 'firms'
              ? 'virevo-pill-active font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          FIRMS Feed
        </button>
      </div>

      {/* Top Right Action Controls with White CTA Pill */}
      <div className="flex items-center gap-2 text-xs">
        {/* Simulate Anomaly White CTA Pill Button (Matching Get Started from Reference) */}
        <button
          onClick={onSimulatePass}
          className="btn-virevo-white flex items-center gap-1.5 px-4 py-2 text-xs"
          title="Simulate thermal anomaly detection"
        >
          <Sparkles size={13} className="text-[#FF007A]" />
          <span>Simulate Anomaly</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-obsidian-900/80 p-2 text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
          title="Refresh telemetry"
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-[#FF5722]' : ''} />
        </button>

        {/* Audio Siren Toggle */}
        <button
          onClick={onToggleSound}
          className={`rounded-full border p-2 transition-colors ${
            soundEnabled
              ? 'border-purple-500/40 bg-purple-950/40 text-purple-300'
              : 'border-white/10 bg-obsidian-900/80 text-slate-500 hover:text-white'
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
              ? 'border-[#FF007A]/50 bg-[#FF007A]/20 text-[#FF2A6D] shadow-[0_0_15px_rgba(255,0,122,0.3)]'
              : 'border-white/10 bg-obsidian-900/80 text-slate-400 hover:text-white'
          }`}
          title="Incident Alerts"
        >
          <Bell size={14} className={activeAlertCount > 0 ? 'animate-bounce' : ''} />
          {activeAlertCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF007A] px-1 text-[9px] font-bold text-white">
              {activeAlertCount}
            </span>
          )}
        </button>

        {/* API Keys Configuration */}
        <button
          onClick={onOpenApiKeys}
          className="rounded-full border border-white/10 bg-obsidian-900/80 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          title="NASA FIRMS & Gemini API Keys"
        >
          <Key size={14} />
        </button>
      </div>
    </header>
  );
};
