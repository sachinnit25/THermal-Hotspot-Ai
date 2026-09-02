import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Crosshair, 
  Layers, 
  MapPin, 
  Maximize2, 
  Navigation, 
  Radio, 
  ShieldAlert, 
  Sparkles, 
  Compass,
  Flame,
  Info
} from 'lucide-react';
import { Hotspot, HotspotClass } from '../types/hotspot';

interface InvestigationMapProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onQuickAssess?: (hotspot: Hotspot) => void;
}

const REGION_PRESETS = [
  { name: 'Global Overview', lat: 20.0, lon: 10.0, zoom: 2 },
  { name: 'Durgapur Industrial Corridor (IN)', lat: 23.5488, lon: 87.2916, zoom: 10 },
  { name: 'Houston Petrochemical Hub (US)', lat: 29.7289, lon: -95.1245, zoom: 11 },
  { name: 'California Wildfire Sector (US)', lat: 39.8214, lon: -121.4398, zoom: 9 },
  { name: 'Jubail Refining Belt (SA)', lat: 27.0142, lon: 49.6582, zoom: 10 },
  { name: 'Punjab Crop Fire Belt (IN)', lat: 30.3214, lon: 75.8452, zoom: 9 },
  { name: 'Pilbara Mining Basin (AU)', lat: -23.2145, lon: 119.7412, zoom: 8 },
];

const MAP_LAYERS = {
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  voyager: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
};

const CLASS_COLORS: Record<HotspotClass, { color: string; label: string }> = {
  industrial: { color: '#13c8ff', label: 'Industrial Thermal Source' },
  wildfire: { color: '#ff4b72', label: 'Wildfire Anomaly' },
  agricultural: { color: '#ffb020', label: 'Agricultural Burn' },
  gas_flare: { color: '#8c52ff', label: 'Gas Flare Stack' },
  mining: { color: '#10e796', label: 'Mining / Smelter' },
  unknown: { color: '#94a3b8', label: 'Unclassified Signal' },
};

export const InvestigationMap: React.FC<InvestigationMapProps> = ({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
  onQuickAssess,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeTileType, setActiveTileType] = useState<'dark' | 'satellite' | 'voyager'>('dark');
  const [selectedRegion, setSelectedRegion] = useState<string>('Global Overview');
  const [showHeatGlow, setShowHeatGlow] = useState<boolean>(true);
  const [hoveredCoords, setHoveredCoords] = useState<{ lat: number; lon: number } | null>(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.5, 87.2],
      zoom: 3,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark Tile layer by default
    const tileLayer = L.tileLayer(MAP_LAYERS.dark, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    baseTileLayerRef.current = tileLayer;

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Marker Layer Group
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    // Mousemove coordinate tracking
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      setHoveredCoords({ lat: e.latlng.lat, lon: e.latlng.lng });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Base Tile Layer
  useEffect(() => {
    if (!mapInstanceRef.current || !baseTileLayerRef.current) return;
    baseTileLayerRef.current.setUrl(MAP_LAYERS[activeTileType]);
  }, [activeTileType]);

  // Render Hotspot Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    hotspots.forEach((hs) => {
      const cls = hs.assessment?.classification || 'unknown';
      const colorInfo = CLASS_COLORS[cls];
      const isSelected = selectedHotspot?.id === hs.id;
      const isHighRisk = (hs.assessment?.industrialRisk ?? 0) >= 0.72;

      // Size scaled with FRP
      const baseSize = Math.min(32, Math.max(16, Math.round(16 + (hs.frpMW / 250) * 16)));
      const size = isSelected ? baseSize + 8 : baseSize;

      const customIcon = L.divIcon({
        className: 'custom-hotspot-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `
          <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center; cursor: pointer;">
            ${
              showHeatGlow
                ? `<div style="position: absolute; inset: -${isSelected ? 10 : 6}px; border-radius: 9999px; background: ${colorInfo.color}; opacity: ${
                    isSelected ? 0.45 : isHighRisk ? 0.35 : 0.2
                  }; filter: blur(${isSelected ? 8 : 5}px); animation: ${isHighRisk ? 'radar-pulse 1.8s infinite' : 'none'};"></div>`
                : ''
            }
            <div style="width: ${size}px; height: ${size}px; border-radius: 9999px; background: ${colorInfo.color}; border: 2px solid #ffffff; box-shadow: 0 0 12px ${colorInfo.color}; display: flex; align-items: center; justify-content: center; transform: ${
              isSelected ? 'scale(1.15)' : 'scale(1)'
            }; transition: transform 0.2s;">
              <div style="width: 4px; height: 4px; border-radius: 9999px; background: #ffffff;"></div>
            </div>
          </div>
        `,
      });

      const marker = L.marker([hs.latitude, hs.longitude], { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-1 font-sans text-xs';
      popupContent.innerHTML = `
        <div class="flex items-center gap-2 mb-1.5 border-b border-white/10 pb-1.5">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${colorInfo.color}; box-shadow:0 0 6px ${colorInfo.color};"></span>
          <span class="font-bold text-white uppercase tracking-wider text-[11px]">${colorInfo.label}</span>
        </div>
        <p class="text-slate-200 font-semibold text-xs mb-1">${hs.locationName}</p>
        <div class="grid grid-cols-2 gap-2 my-2 bg-black/30 p-2 rounded-lg border border-white/5 font-mono text-[10px]">
          <div><span class="text-slate-400">Coords:</span> <span class="text-cyan-300">${hs.latitude.toFixed(3)}°, ${hs.longitude.toFixed(3)}°</span></div>
          <div><span class="text-slate-400">Sensor:</span> <span class="text-slate-200">${hs.source}</span></div>
          <div><span class="text-slate-400">FRP:</span> <span class="text-amber-300 font-bold">${hs.frpMW.toFixed(1)} MW</span></div>
          <div><span class="text-slate-400">Radiance:</span> <span class="text-cyan-200">${hs.brightnessK.toFixed(1)} K</span></div>
          <div><span class="text-slate-400">Risk Score:</span> <span class="${isHighRisk ? 'text-rose-400 font-bold' : 'text-slate-300'}">${((hs.assessment?.industrialRisk ?? 0) * 100).toFixed(0)}%</span></div>
          <div><span class="text-slate-400">Confidence:</span> <span class="text-emerald-400">${hs.satelliteConfidence}%</span></div>
        </div>
        <p class="text-[11px] text-slate-300 line-clamp-2 my-1.5 italic">${hs.assessment?.explanation || 'Awaiting deep contextual assessment...'}</p>
        <button id="inspect-btn-${hs.id}" class="w-full mt-1.5 py-1 px-2.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 font-medium text-[11px] transition-all flex items-center justify-center gap-1.5">
          <span>Open Evidence Workbench</span> →
        </button>
      `;

      popupContent.querySelector(`#inspect-btn-${hs.id}`)?.addEventListener('click', () => {
        onSelectHotspot(hs);
      });

      marker.bindPopup(popupContent, { maxWidth: 280 });

      marker.on('click', () => {
        onSelectHotspot(hs);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [hotspots, selectedHotspot, showHeatGlow, onSelectHotspot]);

  // Pan to selected hotspot when changed externally
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHotspot) return;
    mapInstanceRef.current.flyTo([selectedHotspot.latitude, selectedHotspot.longitude], 12, {
      duration: 1.2,
    });
  }, [selectedHotspot]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionName = e.target.value;
    setSelectedRegion(regionName);
    const target = REGION_PRESETS.find((r) => r.name === regionName);
    if (target && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([target.lat, target.lon], target.zoom, { duration: 1.4 });
    }
  };

  return (
    <div className="glass-panel relative flex flex-col overflow-hidden rounded-2xl border border-cyan-500/20 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
      {/* Top Map HUD Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-space-900/80 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            <Crosshair size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white tracking-wide">
                Investigation Field & Thermal Grid
              </h2>
              <span className="font-mono text-[10px] uppercase text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30">
                LIVE GIS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Orbital thermal radiance overlays across global surveillance corridors.
            </p>
          </div>
        </div>

        {/* HUD Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Preset Exploration Corridor */}
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-space-850 px-2.5 py-1">
            <Compass size={13} className="text-cyan-400" />
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              className="bg-transparent text-[11px] font-medium text-slate-200 outline-none cursor-pointer"
            >
              {REGION_PRESETS.map((reg) => (
                <option key={reg.name} value={reg.name} className="bg-space-900 text-white">
                  {reg.name}
                </option>
              ))}
            </select>
          </div>

          {/* Layer Selector */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-700 bg-space-850 p-1">
            <button
              onClick={() => setActiveTileType('dark')}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                activeTileType === 'dark' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark HUD
            </button>
            <button
              onClick={() => setActiveTileType('satellite')}
              className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                activeTileType === 'satellite' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
          </div>

          {/* Thermal Glow Toggle */}
          <button
            onClick={() => setShowHeatGlow(!showHeatGlow)}
            className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium transition-colors ${
              showHeatGlow
                ? 'border-amber-500/30 bg-amber-950/40 text-amber-300'
                : 'border-slate-700 bg-space-850 text-slate-400'
            }`}
            title="Toggle radiance halo glow effect"
          >
            <Flame size={12} />
            <span className="hidden sm:inline">Heat Halo</span>
          </button>
        </div>
      </div>

      {/* Map Canvas */}
      <div className="relative h-[480px] sm:h-[560px] w-full bg-[#050816]">
        <div ref={mapContainerRef} className="h-full w-full" />

        {/* Orbit Grid Watermark */}
        <div className="pointer-events-none absolute inset-0 hud-grid opacity-30" />

        {/* Floating Telemetry Coordinates Bar */}
        <div className="pointer-events-none absolute top-3 left-3 z-[400] flex items-center gap-3 rounded-lg border border-white/10 bg-space-950/80 px-3 py-1.5 font-mono text-[11px] text-cyan-300 backdrop-blur-md">
          <Navigation size={12} className="text-cyan-400" />
          <span>
            {hoveredCoords
              ? `LAT: ${hoveredCoords.lat.toFixed(4)}° · LON: ${hoveredCoords.lon.toFixed(4)}°`
              : 'GRID ACTIVE'}
          </span>
        </div>

        {/* Legend Overlay in bottom left */}
        <div className="pointer-events-none absolute bottom-4 left-4 z-[400] flex flex-wrap gap-2.5 rounded-xl border border-white/10 bg-space-950/85 p-2.5 text-[10px] uppercase font-mono tracking-wider text-slate-300 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#13c8ff] shadow-[0_0_8px_#13c8ff]" />
            <span>Industrial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff4b72] shadow-[0_0_8px_#ff4b72]" />
            <span>Wildfire</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ffb020] shadow-[0_0_8px_#ffb020]" />
            <span>Ag Burn</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#8c52ff] shadow-[0_0_8px_#8c52ff]" />
            <span>Gas Flare</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#10e796] shadow-[0_0_8px_#10e796]" />
            <span>Mining</span>
          </div>
        </div>
      </div>
    </div>
  );
};
