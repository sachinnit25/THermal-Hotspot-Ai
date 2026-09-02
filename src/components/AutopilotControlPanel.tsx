import React, { useState } from 'react';
import { 
  Wifi, 
  Gauge, 
  Zap, 
  Flame, 
  ShieldAlert, 
  Sparkles, 
  ChevronRight, 
  SlidersHorizontal,
  Navigation,
  Compass,
  Radio
} from 'lucide-react';
import { Hotspot, HotspotClass } from '../types/hotspot';

interface AutopilotControlPanelProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onOpenWorkbench: (hotspot: Hotspot) => void;
}

const CLASS_BADGES: Record<HotspotClass, { label: string; bg: string; text: string }> = {
  industrial: { label: 'Industrial', bg: 'bg-[#FF5722]/15', text: 'text-[#FF7A00]' },
  wildfire: { label: 'Wildfire', bg: 'bg-[#FF007A]/15', text: 'text-[#FF2A6D]' },
  agricultural: { label: 'Ag Burn', bg: 'bg-[#FFB703]/15', text: 'text-[#FFB703]' },
  gas_flare: { label: 'Gas Flare', bg: 'bg-[#9333EA]/15', text: 'text-[#A855F7]' },
  mining: { label: 'Mining', bg: 'bg-emerald-500/15', text: 'text-emerald-300' },
  unknown: { label: 'Unknown', bg: 'bg-slate-500/15', text: 'text-slate-300' },
};

export const AutopilotControlPanel: React.FC<AutopilotControlPanelProps> = ({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  onOpenWorkbench,
}) => {
  const [autopilotEnabled, setAutopilotEnabled] = useState<boolean>(true);
  const [flightMode, setFlightMode] = useState<'eco' | 'smart' | 'turbo'>('smart');

  return (
    <div className="flex flex-col gap-4 w-full">
      {/* 1. Autopilot Controls & Speed Gauges Card */}
      <div className="virevo-card p-4 sm:p-5 space-y-4">
        {/* Autopilot Run Toggle */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3.5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Autopilot Run
            </h3>
            <p className="text-[10px] text-slate-400">Autonomous thermal patrol</p>
          </div>

          {/* Gradient Toggle Switch */}
          <button
            onClick={() => setAutopilotEnabled(!autopilotEnabled)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              autopilotEnabled ? 'bg-virevo-gradient shadow-[0_0_12px_rgba(255,0,122,0.5)]' : 'bg-slate-800'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autopilotEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Flight Mode Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Flight mode</span>
            <div className="flex items-center gap-1 rounded-full border border-white/5 bg-obsidian-900 p-1">
              <button
                onClick={() => setFlightMode('eco')}
                className={`px-3 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  flightMode === 'eco' ? 'bg-[#FFB703] text-black shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Eco
              </button>
              <button
                onClick={() => setFlightMode('smart')}
                className={`px-3 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  flightMode === 'smart' ? 'bg-virevo-gradient text-white shadow-[0_0_10px_rgba(255,0,122,0.4)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Smart
              </button>
              <button
                onClick={() => setFlightMode('turbo')}
                className={`px-3 py-0.5 rounded-full text-[10px] font-bold transition-all ${
                  flightMode === 'turbo' ? 'bg-[#FF007A] text-white shadow-[0_0_10px_rgba(255,0,122,0.5)]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Turbo
              </button>
            </div>
          </div>
        </div>

        {/* Segmented Gradient LED Gauge 1: Max Speed */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Max Speed</span>
            <span className="font-mono text-xs text-white font-bold">45 km/h</span>
          </div>
          {/* Segmented Gradient Bars */}
          <div className="flex items-center gap-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-sm ${
                  i < 12
                    ? 'bg-gradient-to-t from-[#FF007A] to-[#FF5722] shadow-[0_0_6px_rgba(255,0,122,0.6)]'
                    : 'bg-white/5'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Segmented Gradient LED Gauge 2: Scan Power */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Scan Power</span>
            <span className="font-mono text-xs text-white font-bold">360 m/s</span>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-3 rounded-sm ${
                  i < 14
                    ? 'bg-gradient-to-t from-[#7928CA] to-[#FFB703] shadow-[0_0_6px_rgba(255,183,3,0.6)]'
                    : 'bg-white/5'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Wi-Fi Signal & Max Ceiling */}
        <div className="border-t border-white/5 pt-3.5 space-y-3">
          <div className="flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Wifi size={13} className="text-cyan-400" />
              <span>Wi-Fi Signal</span>
            </div>
            <span className="font-mono text-[10px] text-white bg-white/5 px-2.5 py-0.5 rounded-full border border-white/10 font-bold">
              Smart · -48 dBm
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400 font-medium">Max Altitude</span>
              <span className="font-mono text-xs text-white font-bold">450 m</span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: 16 }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-3 rounded-sm ${
                    i < 9
                      ? 'bg-gradient-to-t from-[#FF007A] to-[#FFB703] shadow-[0_0_6px_rgba(255,87,34,0.6)]'
                      : 'bg-white/5'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Active Hotspot Signal Queue Card */}
      <div className="virevo-card p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-[#FF5722]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Hotspot Queue
            </h3>
          </div>
          <span className="font-mono text-[9px] font-bold text-white bg-virevo-gradient px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,0,122,0.35)]">
            {hotspots.length} ACTIVE
          </span>
        </div>

        {/* Scrollable list of active hotspots */}
        <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
          {hotspots.slice(0, 6).map((hs) => {
            const isSelected = selectedHotspot?.id === hs.id;
            const cls = hs.assessment?.classification || 'unknown';
            const badge = CLASS_BADGES[cls];
            const isHighRisk = (hs.assessment?.industrialRisk ?? 0) >= 0.72 || cls === 'wildfire';

            return (
              <div
                key={hs.id}
                onClick={() => onSelectHotspot(hs)}
                className={`group rounded-2xl p-2.5 transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-white/30 bg-white/10 shadow-[0_0_20px_rgba(255,0,122,0.3)]'
                    : 'border-white/5 bg-obsidian-900/70 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {isHighRisk && (
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FF007A] animate-ping shrink-0" />
                      )}
                      <h4 className="text-[11px] font-bold text-white truncate group-hover:text-[#FF2A6D] transition-colors">
                        {hs.locationName}
                      </h4>
                    </div>
                    <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                      {hs.country} · {hs.frpMW.toFixed(1)} MW FRP
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold shrink-0 ${badge.bg} ${badge.text}`}>
                    {badge.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Assess White Pill CTA Button (Matching Reference) */}
        {selectedHotspot && (
          <button
            onClick={() => onOpenWorkbench(selectedHotspot)}
            className="btn-virevo-white mt-3 w-full py-2.5 text-xs flex items-center justify-center gap-2"
          >
            <Sparkles size={13} className="text-[#FF007A]" />
            <span>Open AI Evidence Dossier</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
