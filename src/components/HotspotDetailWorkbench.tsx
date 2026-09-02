import React, { useState } from 'react';
import { 
  ShieldAlert, 
  MapPin, 
  Activity, 
  Sparkles, 
  Factory, 
  Flame, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Compass, 
  Send, 
  Download,
  Layers,
  ChevronRight,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { Hotspot, HotspotClass, RiskLevel } from '../types/hotspot';

interface HotspotDetailWorkbenchProps {
  hotspot: Hotspot | null;
  onAssessWithAI: (hotspot: Hotspot) => void;
  onTriggerAlert: (hotspot: Hotspot) => void;
  onToggleReviewed: (hotspotId: string) => void;
  onSaveNotes: (hotspotId: string, notes: string) => void;
  isAssessing?: boolean;
}

const CLASS_THEME: Record<HotspotClass, { title: string; color: string; bg: string; border: string }> = {
  industrial: { title: 'Industrial Thermal Source', color: 'text-cyan-300', bg: 'bg-cyan-950/40', border: 'border-cyan-500/40' },
  wildfire: { title: 'Wildfire Anomaly', color: 'text-rose-300', bg: 'bg-rose-950/40', border: 'border-rose-500/40' },
  agricultural: { title: 'Agricultural Crop Burn', color: 'text-amber-300', bg: 'bg-amber-950/40', border: 'border-amber-500/40' },
  gas_flare: { title: 'Gas Flare Stack', color: 'text-purple-300', bg: 'bg-purple-950/40', border: 'border-purple-500/40' },
  mining: { title: 'Mining / Smelting Concession', color: 'text-emerald-300', bg: 'bg-emerald-950/40', border: 'border-emerald-500/40' },
  unknown: { title: 'Unclassified Anomaly', color: 'text-slate-300', bg: 'bg-slate-900/40', border: 'border-slate-700' },
};

export const HotspotDetailWorkbench: React.FC<HotspotDetailWorkbenchProps> = ({
  hotspot,
  onAssessWithAI,
  onTriggerAlert,
  onToggleReviewed,
  onSaveNotes,
  isAssessing = false,
}) => {
  const [notesText, setNotesText] = useState<string>(hotspot?.notes || '');

  if (!hotspot) {
    return (
      <div className="glass-panel flex h-full min-h-[460px] flex-col items-center justify-center rounded-2xl border border-white/10 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 shadow-[0_0_30px_rgba(19,200,255,0.1)]">
          <Sparkles size={28} />
        </div>
        <h3 className="mt-4 text-base font-semibold text-white">AI Evidence Workbench Idle</h3>
        <p className="mt-1.5 max-w-sm text-xs text-slate-400 leading-relaxed">
          Select any satellite detection from the Investigation Map or Signal Queue to unlock the deep contextual AI classification report, multi-factor radar, and industrial hazard indices.
        </p>
      </div>
    );
  }

  const assessment = hotspot.assessment;
  const cls = assessment?.classification || 'unknown';
  const theme = CLASS_THEME[cls];
  const industrialRisk = assessment?.industrialRisk ?? 0;
  const isCritical = industrialRisk >= 0.72;

  const handleNotesBlur = () => {
    onSaveNotes(hotspot.id, notesText);
  };

  const handleExportSingleJson = () => {
    const jsonStr = JSON.stringify(hotspot, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hotspot-dossier-${hotspot.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass-panel flex flex-col rounded-2xl border border-cyan-500/20 overflow-hidden shadow-2xl">
      {/* Workbench Header */}
      <div className="border-b border-white/10 bg-space-900/90 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                ASSESSMENT WORKBENCH
              </span>
              <span className="font-mono text-[10px] text-slate-500">
                ID: {hotspot.externalId}
              </span>
              {hotspot.reviewedByAnalyst && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 size={11} /> Analyst Verified
                </span>
              )}
            </div>
            <h2 className="text-lg font-bold text-white sm:text-xl tracking-tight">
              {hotspot.locationName}
            </h2>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <MapPin size={12} className="text-cyan-400" />
              <span>{hotspot.country}</span>
              <span>·</span>
              <span className="font-mono text-cyan-300">{hotspot.latitude.toFixed(4)}° N, {hotspot.longitude.toFixed(4)}° E</span>
              <span>·</span>
              <span>Observed: {new Date(hotspot.detectedAt).toUTCString().slice(0, 22)}</span>
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAssessWithAI(hotspot)}
              disabled={isAssessing}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 px-3 py-1.5 text-xs font-semibold text-purple-200 transition-all hover:bg-purple-900/60 hover:border-purple-300 hover:text-white shadow-[0_0_15px_rgba(140,82,255,0.2)]"
            >
              <Sparkles size={14} className={isAssessing ? 'animate-spin text-purple-300' : 'text-purple-400'} />
              <span>{isAssessing ? 'Reasoning...' : 'AI Re-Assess'}</span>
            </button>

            <button
              onClick={() => onTriggerAlert(hotspot)}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-200 transition-all hover:bg-rose-900/60 hover:text-white shadow-[0_0_15px_rgba(255,75,114,0.15)]"
            >
              <ShieldAlert size={14} className="text-rose-400" />
              <span>Dispatch Alert</span>
            </button>

            <button
              onClick={handleExportSingleJson}
              className="rounded-xl border border-slate-700 bg-space-850 p-2 text-slate-400 hover:bg-space-800 hover:text-white transition-colors"
              title="Export Incident JSON"
            >
              <Download size={14} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 space-y-6 overflow-y-auto max-h-[700px]">
        {/* Section 1: AI Classification & Risk Meters */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Classification Tile */}
          <div className={`rounded-xl border p-4 ${theme.bg} ${theme.border}`}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                Primary Classification
              </span>
              <Sparkles size={14} className={theme.color} />
            </div>
            <p className={`mt-2 text-base font-bold tracking-tight ${theme.color}`}>
              {theme.title}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Confidence: <span className="font-bold text-white">{((assessment?.confidence ?? 0.8) * 100).toFixed(0)}%</span>
            </p>
          </div>

          {/* Industrial Risk Score Meter */}
          <div className="rounded-xl border border-white/10 bg-space-850/60 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                Industrial Hazard Index
              </span>
              <span className={`font-mono text-xs font-bold ${isCritical ? 'text-rose-400' : 'text-cyan-300'}`}>
                {(industrialRisk * 100).toFixed(0)}%
              </span>
            </div>
            <div className="mt-2.5 h-2 w-full rounded-full bg-white/10 overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isCritical ? 'bg-rose-500 shadow-[0_0_10px_#ff4b72]' : industrialRisk > 0.4 ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
                style={{ width: `${Math.round(industrialRisk * 100)}%` }}
              />
              {/* Threshold mark at 72% */}
              <div 
                className="absolute top-0 bottom-0 w-0.5 bg-rose-400/80 shadow-[0_0_4px_#ff4b72]"
                style={{ left: '72%' }}
                title="Industrial Alert Escalation Threshold (0.72)"
              />
            </div>
            <p className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Threshold: 72%</span>
              <span className={isCritical ? 'text-rose-400 font-semibold' : 'text-slate-500'}>
                {isCritical ? 'ESCALATION TRIGGERED' : 'Within Normal Bounds'}
              </span>
            </p>
          </div>

          {/* Radiative Energy */}
          <div className="rounded-xl border border-white/10 bg-space-850/60 p-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
                Radiative Power (FRP)
              </span>
              <Flame size={14} className="text-amber-400" />
            </div>
            <p className="mt-2 text-xl font-bold font-mono text-amber-300">
              {hotspot.frpMW.toFixed(1)} <span className="text-xs font-sans text-slate-400 font-normal">MW</span>
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Brightness: <span className="font-mono text-white">{hotspot.brightnessK.toFixed(1)} K</span> ({hotspot.dayNight === 'D' ? 'Day' : 'Night'} pass)
            </p>
          </div>
        </div>

        {/* Section 2: AI Contextual Intelligence Narrative */}
        <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-r from-space-850/90 via-space-900/90 to-space-850/90 p-4 sm:p-5">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-200">
              AI Contextual Intelligence Synthesis
            </h3>
            <span className="ml-auto font-mono text-[10px] text-slate-500">
              Model: {assessment?.modelUsed || 'Orbital-Context-Engine-v2'}
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed font-sans">
            {assessment?.explanation || 'Awaiting deep contextual assessment...'}
          </p>

          {assessment?.recommendedAction && (
            <div className="mt-3.5 flex items-start gap-2.5 rounded-lg border border-cyan-500/30 bg-cyan-950/40 p-3 text-xs text-cyan-200">
              <CheckCircle2 size={15} className="text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cyan-100 uppercase tracking-wider text-[10px] block mb-0.5">
                  Recommended Protocol
                </span>
                <span>{assessment.recommendedAction}</span>
              </div>
            </div>
          )}
        </div>

        {/* Section 3: Contextual Evidence Factors Matrix */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
            <Layers size={14} className="text-cyan-400" />
            <span>Contextual Evidence Radar & Ground Signals</span>
          </h3>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {/* 1. Land Use */}
            <div className="rounded-xl border border-white/5 bg-space-850/50 p-3.5">
              <span className="font-mono text-[10px] text-slate-500 uppercase">Land-Use Zoning</span>
              <p className="mt-1 text-sm font-semibold text-white capitalize flex items-center gap-1.5">
                <Factory size={14} className="text-cyan-400" />
                {hotspot.evidence.landUse || 'Unmapped'}
              </p>
              <p className="mt-1 text-[10px] text-slate-400">Satellite zoning classification</p>
            </div>

            {/* 2. Facility Proximity */}
            <div className="rounded-xl border border-white/5 bg-space-850/50 p-3.5">
              <span className="font-mono text-[10px] text-slate-500 uppercase">Nearest Industrial Asset</span>
              <p className="mt-1 text-sm font-semibold text-white truncate">
                {hotspot.evidence.nearestFacilityName || 'No immediate facility'}
              </p>
              <p className="mt-1 text-[10px] text-cyan-300 font-mono">
                {hotspot.evidence.nearbyIndustrialMeters != null ? `${hotspot.evidence.nearbyIndustrialMeters}m proximity` : 'Remote sector'}
              </p>
            </div>

            {/* 3. Recurrence Pattern */}
            <div className="rounded-xl border border-white/5 bg-space-850/50 p-3.5">
              <span className="font-mono text-[10px] text-slate-500 uppercase">90-Day Recurrence</span>
              <p className="mt-1 text-sm font-semibold text-white font-mono flex items-center gap-1.5">
                <Activity size={14} className="text-purple-400" />
                {hotspot.evidence.recurrenceCount ?? 1} Detections
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                {(hotspot.evidence.recurrenceCount ?? 1) > 5 ? 'Stationary emitter' : 'Transient anomaly'}
              </p>
            </div>

            {/* 4. Satellite Sensor */}
            <div className="rounded-xl border border-white/5 bg-space-850/50 p-3.5">
              <span className="font-mono text-[10px] text-slate-500 uppercase">Sensor Telemetry</span>
              <p className="mt-1 text-sm font-semibold text-white font-mono">
                {hotspot.source}
              </p>
              <p className="mt-1 text-[10px] text-slate-400">
                Confidence: {hotspot.satelliteConfidence}%
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: Contributing Factors Weighting */}
        {assessment?.contributingFactors && assessment.contributingFactors.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
              Decision Weights Breakdown
            </h3>
            <div className="divide-y divide-white/5 rounded-xl border border-white/10 bg-space-850/30 overflow-hidden">
              {assessment.contributingFactors.map((factor, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 text-xs">
                  <div className="space-y-0.5">
                    <span className="font-semibold text-slate-200">{factor.factor}</span>
                    <p className="text-[11px] text-slate-400">{factor.description}</p>
                  </div>
                  <span className="font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/20 text-[11px] shrink-0 ml-3">
                    +{(factor.weight * 100).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 5: Analyst Notes & Review */}
        <div className="rounded-xl border border-white/10 bg-space-850/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Analyst Incident Log & Notes
            </label>
            <button
              onClick={() => onToggleReviewed(hotspot.id)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                hotspot.reviewedByAnalyst
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/5 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              <CheckCircle2 size={13} />
              <span>{hotspot.reviewedByAnalyst ? 'Reviewed' : 'Mark as Reviewed'}</span>
            </button>
          </div>
          <textarea
            value={notesText}
            onChange={(e) => setNotesText(e.target.value)}
            onBlur={handleNotesBlur}
            placeholder="Add operational notes, cross-reference ground reports, or dispatch logs..."
            rows={3}
            className="w-full rounded-xl border border-slate-700 bg-space-900 p-3 text-xs text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
          />
        </div>
      </div>
    </div>
  );
};
