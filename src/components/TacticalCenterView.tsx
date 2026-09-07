import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
//import 'leaflet/dist/leaflet.css'; // FIX: required or the map renders broken
import {
  Flame,
  Compass,
  ZoomIn,
  ZoomOut,
  Target,
  Crosshair,
  Radio,
} from 'lucide-react';
import { Hotspot, HotspotClass } from '../types/hotspot';

interface TacticalCenterViewProps {
  hotspots: Hotspot[];
  selectedHotspot: Hotspot | null;
  onSelectHotspot: (hotspot: Hotspot) => void;
  onQuickAssess?: (hotspot: Hotspot) => void;
}

const REGION_PRESETS = [
  { name: 'Global Overview', lat: 23.5, lon: 87.2, zoom: 4 },
  { name: 'Durgapur Industrial Belt (IN)', lat: 23.5488, lon: 87.2916, zoom: 11 },
  { name: 'Houston Petrochemical Hub (US)', lat: 29.7289, lon: -95.1245, zoom: 11 },
  { name: 'California Wildfire Sector (US)', lat: 39.8214, lon: -121.4398, zoom: 10 },
  { name: 'Jubail Refining Belt (SA)', lat: 27.0142, lon: 49.6582, zoom: 10 },
  { name: 'Punjab Crop Fire Belt (IN)', lat: 30.3214, lon: 75.8452, zoom: 10 },
  { name: 'Pilbara Mining Basin (AU)', lat: -23.2145, lon: 119.7412, zoom: 8 },
];

const MAP_TILE_PROVIDERS = {
  satellite:
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  dark:
    'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
};

const CLASS_COLORS: Record<HotspotClass, { color: string; label: string }> = {
  industrial: { color: '#FF8A00', label: 'Industrial Heat Source' },
  wildfire: { color: '#FF3B30', label: 'Wildfire Flame Anomaly' },
  agricultural: { color: '#FFB347', label: 'Agricultural Burn' },
  gas_flare: { color: '#38BDF8', label: 'Gas Flare Stack' },
  mining: { color: '#22C55E', label: 'Mining / Smelter' },
  unknown: { color: '#94A3B8', label: 'Unclassified Anomaly' },
};

export const TacticalCenterView: React.FC<TacticalCenterViewProps> = ({
  hotspots,
  selectedHotspot,
  onSelectHotspot,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const baseTileLayerRef = useRef<L.TileLayer | null>(null);

  const [activeTile, setActiveTile] = useState<'satellite' | 'dark'>('satellite');
 const [thermalPalette, setThermalPalette] = useState<
  'inferno' | 'ironbow' | 'whitehot' | 'normal'
>('inferno');
  const [hudOverlay, setHudOverlay] = useState(true);
  const [laserScan, setLaserScan] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('Durgapur Industrial Belt (IN)');

  const currentHotspot =
    selectedHotspot || (hotspots.length > 0 ? hotspots[0] : null);

  /* ============================================================
   * LEAFLET MAP INITIALIZATION
   * ============================================================ */
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const container = mapContainerRef.current;

    const initialLat = currentHotspot?.latitude ?? 23.5488;
    const initialLon = currentHotspot?.longitude ?? 87.2916;

    const map = L.map(container, {
      center: [initialLat, initialLon],
      zoom: 10,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: false,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    const satelliteLayer = L.tileLayer(MAP_TILE_PROVIDERS.satellite, {
      maxZoom: 19,
      attribution: '&copy; Esri',
    });

    satelliteLayer.addTo(map);
    baseTileLayerRef.current = satelliteLayer;

    const markers = L.layerGroup();
    markers.addTo(map);
    markersLayerRef.current = markers;

    const resizeMap = () => {
      map.invalidateSize();
    };

    requestAnimationFrame(resizeMap);
    const timer = window.setTimeout(resizeMap, 300);
    window.addEventListener('resize', resizeMap);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', resizeMap);
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
      baseTileLayerRef.current = null;
    };
  }, []);

  /* ============================================================
   * CHANGE MAP TILE
   * ============================================================ */
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = baseTileLayerRef.current;
    if (!map || !layer) return;

    layer.setUrl(MAP_TILE_PROVIDERS[activeTile]);

    const t = setTimeout(() => {
      map.invalidateSize();
    }, 100);
    return () => clearTimeout(t); // FIX: clean up dangling timeout on rapid toggles
  }, [activeTile]);

  /* ============================================================
   * HOTSPOT MARKERS
   * ============================================================ */
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    hotspots.forEach((hs) => {
      // FIX: explicit cast + fallback so an unexpected classification value
      // (or a plain `string` type from the API) can't produce `undefined`
      const classification = (hs.assessment?.classification ??
        'unknown') as HotspotClass;
      const colorInfo = CLASS_COLORS[classification] ?? CLASS_COLORS.unknown;

      const isSelected = selectedHotspot?.id === hs.id;
      const isHighRisk =
        (hs.assessment?.industrialRisk ?? 0) >= 0.72 || classification === 'wildfire';

      // FIX: guard against NaN when frpMW is missing/0/undefined
      const frp = Number.isFinite(hs.frpMW) ? hs.frpMW : 0;
      const baseSize = Math.min(32, Math.max(16, Math.round(16 + (frp / 250) * 16)));

      const size = isSelected ? baseSize + 8 : baseSize;

      const icon = L.divIcon({
        className: 'tactical-drone-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        html: `
          <div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;">
            <div style="position:absolute;inset:-${isSelected ? 12 : 6}px;border-radius:50%;background:${colorInfo.color};opacity:${isSelected ? 0.7 : isHighRisk ? 0.5 : 0.3};filter:blur(${isSelected ? 8 : 4}px);${isHighRisk ? 'animation:gradient-pulse 1.8s infinite;' : ''}"></div>
            ${
              isSelected
                ? `<div style="position:absolute;width:${size + 16}px;height:${size + 16}px;border:2px dashed ${isHighRisk ? '#FF3B30' : '#38BDF8'};border-radius:8px;animation:spin 10s linear infinite;"></div>`
                : ''
            }
            <div style="width:${size}px;height:${size}px;border-radius:50%;background:${colorInfo.color};border:2px solid white;box-shadow:0 0 16px ${colorInfo.color};display:flex;align-items:center;justify-content:center;">
              <div style="width:4px;height:4px;border-radius:50%;background:white;"></div>
            </div>
          </div>
        `,
      });

      const marker = L.marker([hs.latitude, hs.longitude], { icon });
      marker.on('click', () => {
        onSelectHotspot(hs);
      });
      marker.addTo(markersLayer);
    });
  }, [hotspots, selectedHotspot, onSelectHotspot]);

  /* ============================================================
   * FOLLOW SELECTED HOTSPOT
   * ============================================================ */
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !selectedHotspot) return;

    map.flyTo([selectedHotspot.latitude, selectedHotspot.longitude], 11, {
      duration: 1.2,
    });
  }, [selectedHotspot]);

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionName = e.target.value;
    setSelectedRegion(regionName);

    const target = REGION_PRESETS.find((region) => region.name === regionName);
    if (!target || !mapInstanceRef.current) return;

    mapInstanceRef.current.flyTo([target.lat, target.lon], target.zoom, {
      duration: 1.4,
    });
  };

  const handleRecenterTarget = () => {
    if (!mapInstanceRef.current || !currentHotspot) return;

    mapInstanceRef.current.flyTo(
      [currentHotspot.latitude, currentHotspot.longitude],
      12,
      { duration: 1 }
    );
  };

  const thermalFilterStyle =
    thermalPalette === 'inferno'
      ? 'contrast(1.15) brightness(0.95) saturate(1.45)'
      : thermalPalette === 'ironbow'
      ? 'hue-rotate(240deg) saturate(1.5) contrast(1.2)'
      : thermalPalette === 'whitehot'
      ? 'grayscale(1) contrast(1.5) brightness(1.05)'
      : 'none';

  return (
    <div className="virevo-card relative flex flex-col overflow-hidden border border-[#1B2935] shadow-[0_20px_60px_rgba(0,0,0,0.85)] min-h-[520px] sm:min-h-[560px] w-full">
      {/* ========================================================
       * TOP HUD OVERLAY - 2-TIER NON-COLLIDING STRUCTURE
       * ======================================================== */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex flex-col gap-2 pointer-events-none">
        {/* Tier 1: System Status on Left & Layer Switcher on Right */}
        <div className="flex items-center justify-between gap-2">
          {/* Left: Live Drone Cam & Coordinates */}
          <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#1B2935] bg-[#05080D]/90 px-3 py-1.5 backdrop-blur-xl shadow-lg">
            <span className="flex h-2 w-2 rounded-full bg-[#38BDF8] animate-ping shrink-0" />
            <span className="font-mono text-[10px] uppercase font-extrabold tracking-wider text-white whitespace-nowrap">
              DRONE CAM · GIS
            </span>
            <span className="text-slate-700">|</span>
            <span className="font-mono text-[10px] text-cyan-300 font-semibold whitespace-nowrap">
              {currentHotspot
                ? `${currentHotspot.latitude.toFixed(4)}°, ${currentHotspot.longitude.toFixed(4)}°`
                : 'IDLE PATROL'}
            </span>
          </div>

          {/* Right: Map Layer Switcher */}
          <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-[#1B2935] bg-[#05080D]/90 p-1 backdrop-blur-xl shadow-lg shrink-0">
            <button
              onClick={() => setActiveTile('satellite')}
              className={`rounded-full px-3 py-1 text-[10px] font-mono font-bold transition-all ${
                activeTile === 'satellite'
                  ? 'bg-[#38BDF8] text-[#05080D] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setActiveTile('dark')}
              className={`rounded-full px-3 py-1 text-[10px] font-mono font-bold transition-all ${
                activeTile === 'dark'
                  ? 'bg-[#38BDF8] text-[#05080D] shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Dark HUD
            </button>
          </div>
        </div>

        {/* Tier 2: Region Preset Selector on Left & Anomaly Alert on Right */}
        <div className="flex items-center justify-between gap-2">
          {/* Region Dropdown */}
          <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-[#1B2935] bg-[#05080D]/90 px-2.5 py-1 backdrop-blur-xl shadow-md">
            <Compass size={12} className="text-[#38BDF8] shrink-0" />
            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              className="bg-transparent text-[10px] font-mono font-semibold text-slate-200 outline-none cursor-pointer max-w-[170px] sm:max-w-[230px] truncate"
            >
              {REGION_PRESETS.map((region) => (
                <option key={region.name} value={region.name} className="bg-[#0B1118] text-white">
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* Active Anomaly / Flame Status Badge */}
          {currentHotspot ? (
            <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#FF3B30]/40 bg-[#05080D]/95 px-3 py-1 text-white shadow-[0_0_20px_rgba(255,59,48,0.25)] backdrop-blur-xl shrink-0">
              <span className="flex h-2 w-2 rounded-full bg-[#FF3B30] animate-ping shrink-0" />
              <span className="text-[10px] uppercase font-bold font-mono text-[#FF6B63] whitespace-nowrap">
                Flame: {currentHotspot.frpMW?.toFixed(1) ?? '64.2'} MW
              </span>
            </div>
          ) : (
            <div className="pointer-events-auto flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-[#05080D]/95 px-3 py-1 text-white backdrop-blur-xl shrink-0">
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
              <span className="text-[10px] uppercase font-bold font-mono text-emerald-300 whitespace-nowrap">
                Scanning Clear
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
       * MAP CANVAS
       * ======================================================== */}
      <div className="relative w-full h-[520px] sm:h-[560px] overflow-hidden bg-[#05080D]">
        <div
          ref={mapContainerRef}
          className="absolute inset-0"
          style={{ filter: thermalFilterStyle }}
        />

        {/* Laser Scan Tactical Cone */}
        {laserScan && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">
            <div
              className="absolute top-1/6 w-0 h-0 border-l-[140px] border-r-[140px] border-b-[260px] border-l-transparent border-r-transparent border-b-[#38BDF8]/10 filter blur-sm opacity-60 animate-pulse"
              style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
            />
            <div className="absolute top-1/6 w-0 h-0 border-l-[90px] border-r-[90px] border-b-[200px] border-l-transparent border-r-transparent border-b-[#38BDF8]/15 opacity-70 animate-laser-scan" />
          </div>
        )}

        {/* Tactical Crosshair / HUD Overlay */}
        {hudOverlay && (
          <div className="pointer-events-none absolute inset-0 z-[600] flex items-center justify-center">
            <div className="relative flex items-center justify-center">
              <div className="h-36 w-36 rounded-full border border-white/15 border-dashed animate-spin-slow opacity-50" />
              <div className="absolute h-24 w-24 rounded-full border border-[#38BDF8]/30 opacity-60" />
              <div className="absolute h-16 w-16 border-t border-l border-[#38BDF8] -top-2 -left-2 opacity-80" />
              <div className="absolute h-16 w-16 border-t border-r border-[#38BDF8] -top-2 -right-2 opacity-80" />
              <div className="absolute h-16 w-16 border-b border-l border-[#FF8A00] -bottom-2 -left-2 opacity-80" />
              <div className="absolute h-16 w-16 border-b border-r border-[#FF8A00] -bottom-2 -right-2 opacity-80" />
              <div className="absolute h-3 w-3 rounded-full border border-[#38BDF8] shadow-[0_0_10px_#38BDF8] flex items-center justify-center">
                <div className="h-1 w-1 rounded-full bg-white" />
              </div>
            </div>
          </div>
        )}

        {/* Left-Hand Vertical Tool Dock */}
        <div className="pointer-events-auto absolute top-1/2 -translate-y-1/2 left-3 z-[900] flex flex-col gap-1 p-1 rounded-2xl border border-[#1B2935] bg-[#05080D]/90 backdrop-blur-xl shadow-xl">
          <button
            onClick={handleRecenterTarget}
            className="flex h-7 w-7 items-center justify-center rounded-xl text-[#38BDF8] hover:bg-[#38BDF8]/20 transition-all"
            title="Recenter on active target"
          >
            <Target size={14} />
          </button>
          <div className="h-px w-4 bg-[#1B2935] mx-auto my-0.5" />
          <button
            onClick={() => mapInstanceRef.current?.zoomIn()}
            className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-300 hover:text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-all"
            title="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => mapInstanceRef.current?.zoomOut()}
            className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-300 hover:text-[#38BDF8] hover:bg-[#38BDF8]/10 transition-all"
            title="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <div className="h-px w-4 bg-[#1B2935] mx-auto my-0.5" />
          <button
            onClick={() => setHudOverlay((prev) => !prev)}
            className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
              hudOverlay ? 'text-[#38BDF8] bg-[#38BDF8]/20' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={hudOverlay ? 'Hide HUD Reticle' : 'Show HUD Reticle'}
          >
            <Crosshair size={14} />
          </button>
          <button
            onClick={() => setLaserScan((prev) => !prev)}
            className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all ${
              laserScan ? 'text-[#38BDF8] bg-[#38BDF8]/20' : 'text-slate-500 hover:text-slate-300'
            }`}
            title={laserScan ? 'Disable Laser Scan' : 'Enable Laser Scan'}
          >
            <Radio size={14} />
          </button>
        </div>

        {/* Radiance & Sector Info Badge - Positioned safely above bottom bar */}
        <div className="pointer-events-auto absolute bottom-14 right-3 z-[900] flex items-center gap-1.5 rounded-full border border-[#1B2935] bg-[#05080D]/90 px-3 py-1 text-white backdrop-blur-xl shadow-lg">
          <Flame size={12} className="text-[#FF8A00] animate-pulse shrink-0" />
          <span className="text-[10px] uppercase font-bold font-mono text-slate-200">
            Radiance: <span className="text-[#FF8A00]">{currentHotspot?.brightnessK?.toFixed(1) ?? '368.4'} K</span>
            {' · '}
            <span className="text-slate-400">
              {currentHotspot?.locationName
                ? currentHotspot.locationName.length > 22
                  ? currentHotspot.locationName.slice(0, 22) + '...'
                  : currentHotspot.locationName
                : currentHotspot?.country ?? 'Surveillance Grid'}
            </span>
          </span>
        </div>

        {/* Bottom Telemetry & Thermal Palette Bar */}
        <div className="pointer-events-auto absolute bottom-2.5 left-3 right-3 z-[900] flex items-center justify-between gap-2 rounded-2xl border border-[#1B2935] bg-[#05080D]/95 px-3 py-1.5 font-mono text-[10px] text-slate-300 backdrop-blur-xl shadow-xl overflow-x-auto scrollbar-none">
          {/* Left: Sensor Telemetry Details */}
          <div className="flex items-center gap-2.5 shrink-0">
            <span className="text-[#FF3B30] font-bold flex items-center gap-1 whitespace-nowrap">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FF3B30] animate-ping" />
              REC [4K IR]
            </span>
            <span className="text-slate-700">|</span>
            <span className="whitespace-nowrap text-slate-400">ALT: <span className="text-slate-200">120M</span></span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="whitespace-nowrap text-slate-400 hidden sm:inline">ZOOM: <span className="text-slate-200">3.5X</span></span>
            <span className="text-slate-700 hidden md:inline">|</span>
            <span className="whitespace-nowrap text-slate-400 hidden md:inline">PITCH: <span className="text-slate-200">-45°</span></span>
          </div>

          {/* Right: Thermal Palette Switcher */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-slate-400 text-[9px] uppercase hidden sm:inline">Palette:</span>
            <div className="flex items-center gap-0.5 bg-[#05080D]/80 rounded-full p-0.5 border border-[#1B2935]">
              <button
                onClick={() => setThermalPalette('inferno')}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
                  thermalPalette === 'inferno' ? 'bg-[#FF8A00] text-[#05080D]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Inferno
              </button>
              <button
                onClick={() => setThermalPalette('ironbow')}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
                  thermalPalette === 'ironbow' ? 'bg-[#FF8A00] text-[#05080D]' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ironbow
              </button>
              <button
                onClick={() => setThermalPalette('whitehot')}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
                  thermalPalette === 'whitehot' ? 'bg-[#E5E7EB] text-[#05080D]' : 'text-slate-400 hover:text-white'
                }`}
              >
                WhiteHot
              </button>
              <button
                onClick={() => setThermalPalette('normal')}
                className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
                  thermalPalette === 'normal' ? 'bg-[#38BDF8] text-[#05080D]' : 'text-slate-400 hover:text-white'
                }`}
              >
                TrueColor
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};