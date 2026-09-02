import React from 'react';
import { 
  Activity, 
  ShieldAlert, 
  Sparkles, 
  Flame, 
  TrendingUp, 
  CheckCircle, 
  Factory,
  Radio
} from 'lucide-react';
import { DashboardMetrics, RiskLevel } from '../types/hotspot';

interface MetricsOverviewProps {
  metrics: DashboardMetrics;
  onFilterRisk?: (risk: RiskLevel | 'all') => void;
  selectedRiskFilter?: string;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  metrics,
  onFilterRisk,
  selectedRiskFilter,
}) => {
  return (
    <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
      {/* 1. Total Detections */}
      <div 
        onClick={() => onFilterRisk && onFilterRisk('all')}
        className={`glass-panel group relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all cursor-pointer hover:border-cyan-400/40 ${
          selectedRiskFilter === 'all' || !selectedRiskFilter ? 'glass-panel-glow-cyan' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 group-hover:scale-105 transition-transform">
            <Activity size={20} />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-slate-500 bg-white/5 px-2 py-0.5 rounded border border-white/5">
            FIRMS WINDOW
          </span>
        </div>
        <p className="mt-3.5 text-xs font-medium uppercase tracking-wider text-slate-400">
          Total Thermal Detections
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-white font-mono">
            {metrics.totalDetections}
          </span>
          <span className="text-xs text-cyan-400 flex items-center font-medium">
            <TrendingUp size={12} className="mr-0.5 inline" /> {metrics.recentActivity24h} in 24h
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>MODIS & VIIRS telemetry streams</span>
        </div>
      </div>

      {/* 2. High-Risk Industrial Candidates */}
      <div 
        onClick={() => onFilterRisk && onFilterRisk('critical')}
        className={`glass-panel group relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all cursor-pointer hover:border-rose-400/40 ${
          selectedRiskFilter === 'critical' ? 'glass-panel-glow-rose' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 group-hover:scale-105 transition-transform">
            <ShieldAlert size={20} className="text-rose-400" />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-rose-400/90 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
            RISK ≥ 0.72
          </span>
        </div>
        <p className="mt-3.5 text-xs font-medium uppercase tracking-wider text-slate-400">
          High-Risk Industrial Signals
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-white font-mono text-rose-200">
            {metrics.highRiskIndustrialCandidates}
          </span>
          <span className="text-xs text-rose-400 font-medium">
            Priority Review
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse"></span>
          <span>Facility proximity & high persistence</span>
        </div>
      </div>

      {/* 3. AI Assessments */}
      <div 
        onClick={() => onFilterRisk && onFilterRisk('elevated')}
        className={`glass-panel group relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all cursor-pointer hover:border-purple-400/40 ${
          selectedRiskFilter === 'elevated' ? 'glass-panel-glow-violet' : ''
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-300 border border-purple-500/20 group-hover:scale-105 transition-transform">
            <Sparkles size={20} />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-purple-300 bg-purple-950/40 px-2 py-0.5 rounded border border-purple-500/30">
            CONTEXT ENGINE
          </span>
        </div>
        <p className="mt-3.5 text-xs font-medium uppercase tracking-wider text-slate-400">
          AI Multi-Factor Coverage
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-white font-mono text-purple-200">
            {Math.round((metrics.totalAssessed / (metrics.totalDetections || 1)) * 100)}%
          </span>
          <span className="text-xs text-purple-300 font-medium">
            {metrics.totalAssessed} Analyzed
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400"></span>
          <span>Avg. Model Confidence: {metrics.avgConfidence.toFixed(0)}%</span>
        </div>
      </div>

      {/* 4. Peak Radiative Heat (FRP) */}
      <div className="glass-panel group relative overflow-hidden rounded-2xl p-4 sm:p-5 transition-all hover:border-amber-400/40">
        <div className="flex items-center justify-between">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20 group-hover:scale-105 transition-transform">
            <Flame size={20} />
          </div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
            ENERGY MW
          </span>
        </div>
        <p className="mt-3.5 text-xs font-medium uppercase tracking-wider text-slate-400">
          Peak Radiative Power (FRP)
        </p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-3xl font-bold tracking-tight text-white font-mono text-amber-200">
            {metrics.maxFrpMW.toFixed(1)}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            MegaWatts
          </span>
        </div>
        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
          <span>Highest active combustion intensity</span>
        </div>
      </div>
    </div>
  );
};
