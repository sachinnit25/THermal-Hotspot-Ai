import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Flame, 
  ShieldAlert, 
  Sparkles, 
  SlidersHorizontal, 
  Layers, 
  ChevronRight, 
  Clock, 
  ArrowUpDown,
  Factory,
  Radio
} from 'lucide-react';
import { Hotspot, HotspotClass, RiskLevel, SatelliteSource } from '../types/hotspot';

interface HotspotListProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onBatchAssess?: () => void;
  selectedRiskFilter?: string;
  onRiskFilterChange?: (risk: RiskLevel | 'all') => void;
}

const CLASS_BADGES: Record<HotspotClass, { label: string; bg: string; text: string; border: string }> = {
  industrial: { label: 'Industrial', bg: 'bg-cyan-500/10', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  wildfire: { label: 'Wildfire', bg: 'bg-rose-500/10', text: 'text-rose-300', border: 'border-rose-500/30' },
  agricultural: { label: 'Ag Burn', bg: 'bg-amber-500/10', text: 'text-amber-300', border: 'border-amber-500/30' },
  gas_flare: { label: 'Gas Flare', bg: 'bg-purple-500/10', text: 'text-purple-300', border: 'border-purple-500/30' },
  mining: { label: 'Mining', bg: 'bg-emerald-500/10', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  unknown: { label: 'Unknown', bg: 'bg-slate-500/10', text: 'text-slate-300', border: 'border-slate-500/30' },
};

export const HotspotList: React.FC<HotspotListProps> = ({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  onBatchAssess,
  selectedRiskFilter = 'all',
  onRiskFilterChange,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'time' | 'risk' | 'frp' | 'brightness'>('risk');

  // Filtered & Sorted Hotspots
  const filteredHotspots = useMemo(() => {
    return hotspots
      .filter((hs) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchLoc = hs.locationName.toLowerCase().includes(q);
          const matchCountry = hs.country.toLowerCase().includes(q);
          const matchFacility = hs.evidence.nearestFacilityName?.toLowerCase().includes(q);
          const matchCoords = `${hs.latitude.toFixed(2)},${hs.longitude.toFixed(2)}`.includes(q);
          if (!matchLoc && !matchCountry && !matchFacility && !matchCoords) return false;
        }

        // Classification filter
        if (classFilter !== 'all' && hs.assessment?.classification !== classFilter) {
          return false;
        }

        // Risk level filter
        if (selectedRiskFilter !== 'all' && hs.assessment?.riskLevel !== selectedRiskFilter) {
          return false;
        }

        // Source filter
        if (sourceFilter !== 'all' && hs.source !== sourceFilter) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'risk') {
          return (b.assessment?.industrialRisk ?? 0) - (a.assessment?.industrialRisk ?? 0);
        }
        if (sortBy === 'frp') {
          return b.frpMW - a.frpMW;
        }
        if (sortBy === 'brightness') {
          return b.brightnessK - a.brightnessK;
        }
        return new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime();
      });
  }, [hotspots, searchQuery, classFilter, selectedRiskFilter, sourceFilter, sortBy]);

  return (
    <div className="glass-panel flex h-[580px] sm:h-[640px] flex-col overflow-hidden rounded-2xl border border-cyan-500/20 shadow-xl">
      {/* Header & Search */}
      <div className="border-b border-white/10 bg-space-900/90 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-cyan-400 animate-pulse" />
            <h2 className="text-sm font-semibold text-white tracking-wide">
              Signal Queue & Detections
            </h2>
          </div>
          <span className="rounded-md bg-cyan-950/60 px-2 py-0.5 font-mono text-[11px] text-cyan-300 border border-cyan-500/30">
            {filteredHotspots.length} Signals
          </span>
        </div>

        {/* Search Input */}
        <div className="relative mt-3">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search coordinates, location, facility..."
            className="w-full rounded-xl border border-slate-700 bg-space-850 py-2 pl-9 pr-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30"
          />
        </div>

        {/* Filter Controls Row */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="rounded-lg border border-slate-700 bg-space-850 px-2 py-1 text-[11px] text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">All Classes</option>
            <option value="industrial">Industrial</option>
            <option value="wildfire">Wildfire</option>
            <option value="agricultural">Agricultural</option>
            <option value="gas_flare">Gas Flare</option>
            <option value="mining">Mining</option>
            <option value="unknown">Unknown</option>
          </select>

          {/* Risk Filter */}
          <select
            value={selectedRiskFilter}
            onChange={(e) => onRiskFilterChange && onRiskFilterChange(e.target.value as any)}
            className="rounded-lg border border-slate-700 bg-space-850 px-2 py-1 text-[11px] text-slate-200 outline-none cursor-pointer"
          >
            <option value="all">All Risks</option>
            <option value="critical">Critical (≥0.72)</option>
            <option value="elevated">Elevated</option>
            <option value="watch">Watch</option>
          </select>

          {/* Sort Control */}
          <div className="ml-auto flex items-center gap-1">
            <ArrowUpDown size={12} className="text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-lg border border-slate-700 bg-space-850 px-2 py-1 text-[11px] text-slate-300 outline-none cursor-pointer"
            >
              <option value="risk">Risk Index</option>
              <option value="frp">FRP (MW)</option>
              <option value="brightness">Radiance (K)</option>
              <option value="time">Newest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Hotspots Scroll List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {filteredHotspots.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
            <Flame size={32} className="mb-2 opacity-40 text-cyan-400" />
            <p className="text-sm font-medium text-slate-300">No thermal signals match filters</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Try adjusting search terms, classification filters, or trigger a satellite pass simulation.
            </p>
          </div>
        ) : (
          filteredHotspots.map((hs) => {
            const isSelected = selectedHotspot?.id === hs.id;
            const cls = hs.assessment?.classification || 'unknown';
            const badge = CLASS_BADGES[cls];
            const riskScore = hs.assessment?.industrialRisk ?? 0;
            const isCritical = riskScore >= 0.72;

            return (
              <div
                key={hs.id}
                onClick={() => onSelectHotspot(hs)}
                className={`group relative rounded-xl p-3 transition-all cursor-pointer border ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(19,200,255,0.15)]'
                    : isCritical
                    ? 'border-rose-500/30 bg-rose-950/20 hover:border-rose-400/50'
                    : 'border-white/5 bg-space-850/60 hover:border-cyan-500/30 hover:bg-space-800/80'
                }`}
              >
                {/* Top Row: Location & Classification Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {isCritical && (
                        <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                      )}
                      <h3 className="font-semibold text-xs text-white truncate group-hover:text-cyan-200 transition-colors">
                        {hs.locationName}
                      </h3>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {hs.country} · <span className="font-mono text-cyan-300">{hs.latitude.toFixed(3)}°, {hs.longitude.toFixed(3)}°</span>
                    </p>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${badge.bg} ${badge.text} ${badge.border}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Middle Row: FRP, Brightness & Confidence */}
                <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono bg-black/30 px-2 py-1.5 rounded-lg border border-white/5">
                  <span className="text-amber-300 font-semibold flex items-center gap-1">
                    <Flame size={12} className="text-amber-400" /> {hs.frpMW.toFixed(1)} MW
                  </span>
                  <span className="text-cyan-300">
                    {hs.brightnessK.toFixed(1)} K
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {hs.source}
                  </span>
                </div>

                {/* Bottom Row: Risk Progress Bar & Time */}
                <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400">
                  <div className="flex items-center gap-1.5 flex-1 mr-3">
                    <span className="text-[9px] uppercase font-mono">Risk</span>
                    <div className="h-1.5 flex-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isCritical ? 'bg-rose-500 shadow-[0_0_8px_#ff4b72]' : riskScore > 0.4 ? 'bg-amber-400' : 'bg-cyan-400'
                        }`}
                        style={{ width: `${Math.round(riskScore * 100)}%` }}
                      />
                    </div>
                    <span className={`font-mono font-bold ${isCritical ? 'text-rose-400' : 'text-slate-300'}`}>
                      {(riskScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <span className="flex items-center gap-1 text-[10px] text-slate-500 shrink-0">
                    <Clock size={11} />
                    {new Date(hs.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="border-t border-white/10 bg-space-900/80 p-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>Displaying {filteredHotspots.length} orbital signatures</span>
        <button
          onClick={onBatchAssess}
          className="flex items-center gap-1 text-cyan-300 hover:text-white transition-colors font-medium text-xs"
        >
          <Sparkles size={13} />
          <span>Re-assess all</span>
        </button>
      </div>
    </div>
  );
};
