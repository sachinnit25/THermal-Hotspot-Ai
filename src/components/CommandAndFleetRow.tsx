import React, { useState } from 'react';
import { 
  Wind, 
  Compass, 
  Users, 
  Mic, 
  MapPin, 
  BatteryCharging, 
  CheckCircle2, 
  Radio, 
  Flame,
  Volume2,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Hotspot } from '../types/hotspot';

interface CommandAndFleetRowProps {
  selectedHotspot: Hotspot | null;
  onDispatchTeam?: (team: string) => void;
}

export const CommandAndFleetRow: React.FC<CommandAndFleetRowProps> = ({
  selectedHotspot,
  onDispatchTeam,
}) => {
  const [isTalking, setIsTalking] = useState<boolean>(false);
  const [talkFeedback, setTalkFeedback] = useState<string | null>(null);

  const handleTalkToggle = () => {
    setIsTalking(!isTalking);
    if (!isTalking) {
      setTalkFeedback('Channel open: Voice comms broadcasting to Field Response Unit...');
      setTimeout(() => setTalkFeedback(null), 3000);
    }
  };

  const handleLocationDispatch = () => {
    if (onDispatchTeam) {
      onDispatchTeam(selectedHotspot?.locationName || 'Sector 4');
    }
    setTalkFeedback(`Dispatched GPS coordinates [${selectedHotspot?.latitude.toFixed(3)}°, ${selectedHotspot?.longitude.toFixed(3)}°] to Rescue Team!`);
    setTimeout(() => setTalkFeedback(null), 3500);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3 w-full">
      {/* 1. AI Drone Auto Detection & Wind Radar Card */}
      <div className="virevo-card p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Radio size={14} className="text-[#FF007A] animate-pulse" />
            <span>AI Auto Detection</span>
          </h3>
          <span className="font-mono text-[9px] uppercase px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10 font-bold">
            AUTO-TRACK
          </span>
        </div>

        {/* Thumbnail Camera Snapshot & Wind Compass */}
        <div className="flex items-center gap-4 flex-1">
          {/* Mini Thermal Sensor Camera Feed */}
          <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-obsidian-900 shadow-inner">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1542317854-f9596aa573f0?q=80&w=400&auto=format&fit=crop')`,
                filter: 'saturate(1.4) contrast(1.2)'
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-obsidian-950 via-transparent to-transparent" />
            <div className="absolute top-1.5 left-1.5 flex items-center gap-1 rounded-full bg-black/70 px-2 py-0.5 font-mono text-[8px] text-[#FF2A6D] font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF007A] animate-ping" />
              <span>AI LOCK</span>
            </div>
            <div className="absolute bottom-1 right-1 font-mono text-[8px] text-slate-400">
              30 FPS
            </div>
          </div>

          {/* Wind Speed & Direction Specs */}
          <div className="flex-1 space-y-2">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">Wind speed</p>
              <p className="text-xl font-extrabold font-mono text-white flex items-baseline gap-1">
                10 <span className="text-xs text-slate-400 font-sans font-normal">km/h</span>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-obsidian-900 text-[#FF5722]">
                <Compass size={18} className="compass-needle-animated" />
              </div>
              <div>
                <p className="text-[9px] text-slate-400 uppercase font-mono">Direction</p>
                <p className="text-xs font-bold font-mono text-[#FFB703]">W-E · 240° SW</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Rescue Team Command & Voice Comms Card */}
      <div className="virevo-card p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users size={14} className="text-[#FF5722]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Rescue Team
            </h3>
          </div>
          <div className="flex items-center gap-2 font-mono text-[9px] text-slate-400">
            <span>Units: <strong className="text-white">6</strong></span>
            <span>·</span>
            <span>Personnel: <strong className="text-white">16</strong></span>
          </div>
        </div>

        {/* Team Leader & Voice Waveform */}
        <div className="space-y-3 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-3 bg-obsidian-900/70 p-2.5 rounded-2xl border border-white/5">
            {/* Leader Avatar */}
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-obsidian-850">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                alt="Leader Avatar"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 border-2 border-obsidian-900" />
            </div>

            {/* Leader Info & Voice Waveform */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[9px] uppercase font-mono text-slate-400">Team Leader</p>
                  <p className="text-xs font-bold text-white truncate">Cpt. Hugo Das</p>
                </div>
                {/* Audio Wave Visualizer with Magenta/Coral/Amber Colors */}
                <div className="flex items-center gap-0.5 h-6">
                  {['#FF007A', '#9333EA', '#FF5722', '#FFB703', '#FF007A', '#9333EA', '#FF5722', '#FFB703', '#FF007A'].map((color, i) => (
                    <span
                      key={i}
                      className="w-1 rounded-full audio-bar"
                      style={{
                        backgroundColor: color,
                        height: `${8 + ((i * 5) % 16)}px`,
                        animationDelay: `${i * 0.15}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feedback Toast */}
          {talkFeedback && (
            <p className="text-[10px] text-[#FFB703] font-mono italic animate-pulse">
              {talkFeedback}
            </p>
          )}

          {/* Action Buttons: [Talk] & [Location] */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleTalkToggle}
              className={`flex items-center justify-center gap-1.5 rounded-full py-2 text-xs font-bold transition-all ${
                isTalking
                  ? 'bg-virevo-gradient text-white shadow-[0_0_16px_rgba(255,0,122,0.5)]'
                  : 'border border-white/10 bg-obsidian-900 text-white hover:bg-obsidian-800'
              }`}
            >
              <Mic size={13} className={isTalking ? 'animate-bounce text-white' : 'text-[#FF007A]'} />
              <span>{isTalking ? 'Transmitting...' : 'Talk'}</span>
            </button>

            <button
              onClick={handleLocationDispatch}
              className="flex items-center justify-center gap-1.5 rounded-full border border-white/10 bg-obsidian-900 py-2 text-xs font-bold text-white hover:bg-obsidian-800 transition-colors"
            >
              <MapPin size={13} className="text-[#FF5722]" />
              <span>Location</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Powering Drones & Fleet Hardware Card */}
      <div className="virevo-card p-4 sm:p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Cpu size={14} className="text-[#FFB703]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              Powering Drones
            </h3>
          </div>
          <span className="font-mono text-[9px] text-slate-400">
            Drones: <strong className="text-white">4 Active</strong>
          </span>
        </div>

        {/* Quadcopter Motor Health Schematic */}
        <div className="relative my-2 flex items-center justify-center">
          <div className="relative w-44 h-24 flex items-center justify-center">
            <svg className="w-full h-full text-[#FF007A]/70" viewBox="0 0 160 80">
              <line x1="30" y1="20" x2="130" y2="60" stroke="#7928CA" strokeWidth="3" strokeLinecap="round" />
              <line x1="130" y1="20" x2="30" y2="60" stroke="#7928CA" strokeWidth="3" strokeLinecap="round" />
              <rect x="65" y="28" width="30" height="24" rx="6" fill="#0E111B" stroke="#FF007A" strokeWidth="2" />
              <circle cx="30" cy="20" r="10" stroke="#FFB703" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(255,0,122,0.2)" />
              <circle cx="130" cy="20" r="10" stroke="#FFB703" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(255,0,122,0.2)" />
              <circle cx="30" cy="60" r="10" stroke="#FFB703" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(255,0,122,0.2)" />
              <circle cx="130" cy="60" r="10" stroke="#FFB703" strokeWidth="1.5" strokeDasharray="4 2" fill="rgba(255,0,122,0.2)" />
            </svg>

            {/* Motor % Overlay Badges */}
            <span className="absolute top-0 left-0 text-[9px] font-mono font-bold text-slate-200 bg-black/70 px-1.5 py-0.5 rounded-md border border-white/10">
              FL <strong className="text-[#FF2A6D]">98%</strong>
            </span>
            <span className="absolute top-0 right-0 text-[9px] font-mono font-bold text-slate-200 bg-black/70 px-1.5 py-0.5 rounded-md border border-white/10">
              FR <strong className="text-[#FF2A6D]">97%</strong>
            </span>
            <span className="absolute bottom-0 left-0 text-[9px] font-mono font-bold text-slate-200 bg-black/70 px-1.5 py-0.5 rounded-md border border-white/10">
              RL <strong className="text-[#FFB703]">96%</strong>
            </span>
            <span className="absolute bottom-0 right-0 text-[9px] font-mono font-bold text-slate-200 bg-black/70 px-1.5 py-0.5 rounded-md border border-white/10">
              RR <strong className="text-[#FFB703]">98%</strong>
            </span>
          </div>
        </div>

        {/* Normal Status Button with Gradient */}
        <div className="flex items-center justify-center">
          <div className="w-full text-center rounded-full bg-virevo-gradient py-2 text-xs font-black text-white shadow-[0_0_16px_rgba(255,0,122,0.4)]">
            Normal · All Systems Operational
          </div>
        </div>
      </div>
    </div>
  );
};
