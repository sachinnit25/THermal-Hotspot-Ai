import React, { useState } from 'react';
import {
  AlertOctagon,
  Flame,
  UserCheck,
  CheckCircle2,
  X,
  Volume2,
  Radio,
  Clock,
  MapPin,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { Hotspot } from '../types/hotspot';

interface MainScreenEmergencyBannerProps {
  hotspot: Hotspot | null;
  onNormalize: (hotspotId: string) => void;
  onDismiss: () => void;
}

export const MainScreenEmergencyBanner: React.FC<MainScreenEmergencyBannerProps> = ({
  hotspot,
  onNormalize,
  onDismiss,
}) => {
  const [workerNotified, setWorkerNotified] = useState<boolean>(false);
  const [isNormalizing, setIsNormalizing] = useState<boolean>(false);

  if (!hotspot) return null;

  const assessment = hotspot.assessment;
  const isCritical = (assessment?.industrialRisk ?? 0) >= 0.70 || hotspot.brightnessK >= 350;

  const handleNotifyWorkers = () => {
    setWorkerNotified(true);
  };

  const handleNormalizeAction = () => {
    setIsNormalizing(true);
    setTimeout(() => {
      onNormalize(hotspot.id);
      setIsNormalizing(false);
      onDismiss();
    }, 600);
  };

  return (
    <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 pointer-events-none animate-in fade-in slide-in-from-top duration-300">
      <div className="pointer-events-auto w-full max-w-4xl rounded-2xl border-2 border-rose-500 bg-gradient-to-r from-rose-950/95 via-slate-950/95 to-rose-950/95 p-4 sm:p-5 shadow-[0_0_50px_rgba(244,63,94,0.4)] backdrop-blur-2xl text-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        
        {/* Left Side: Hazard Icon & Telemetry Info */}
        <div className="flex items-start gap-3.5 flex-1">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500 text-slate-950 shadow-[0_0_20px_rgba(244,63,94,0.6)] animate-pulse">
            <AlertOctagon className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono text-[10px] font-extrabold uppercase border border-rose-500/40 flex items-center gap-1">
                <Flame className="w-3 h-3 text-rose-400 animate-bounce" />
                🚨 MAP ANOMALY DETECTED
              </span>

              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-400" />
                {hotspot.locationName}
              </span>
            </div>

            <h3 className="text-sm font-extrabold text-white tracking-wide">
              {assessment?.explanation || `Thermal anomaly detected at ${hotspot.locationName}. High thermal radiance detected.`}
            </h3>

            <div className="flex items-center gap-4 text-xs font-mono text-slate-300 pt-0.5 flex-wrap">
              <span>
                Temp: <strong className="text-rose-400">{hotspot.brightnessK.toFixed(1)} K</strong> ({(hotspot.brightnessK - 273.15).toFixed(1)}°C)
              </span>
              <span>•</span>
              <span>
                FRP: <strong className="text-amber-400">{hotspot.frpMW.toFixed(1)} MW</strong>
              </span>
              <span>•</span>
              <span className="text-rose-300 font-bold flex items-center gap-1">
                <Clock className="w-3 h-3" /> Breach in ~8 min
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Worker Notification & Normalization Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full md:w-auto">
          {/* Inform Worker Button */}
          <button
            onClick={handleNotifyWorkers}
            className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
              workerNotified
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white shadow-rose-950/50'
            }`}
          >
            {workerNotified ? (
              <>
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Worker & Team Notified ✓</span>
              </>
            ) : (
              <>
                <PhoneCall className="w-4 h-4 text-amber-200 animate-pulse" />
                <span>📢 Inform Workers & Dispatch</span>
              </>
            )}
          </button>

          {/* Normalize & Resolve Button */}
          <button
            onClick={handleNormalizeAction}
            disabled={isNormalizing}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 transition-all shadow-lg shadow-cyan-950/40 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isNormalizing ? 'Normalizing...' : '✅ Normalize & Resolve'}</span>
          </button>

          {/* Dismiss */}
          <button
            onClick={onDismiss}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss Notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
