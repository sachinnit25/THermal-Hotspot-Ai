import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Flame,
  Compass,
  ZoomIn,
  ZoomOut,
  Target,
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
    'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
};

const CLASS_COLORS: Record<
  HotspotClass,
  { color: string; label: string }
> = {
  industrial: {
    color: '#FF5722',
    label: 'Industrial Heat Source',
  },
  wildfire: {
    color: '#FF007A',
    label: 'Wildfire Flame Anomaly',
  },
  agricultural: {
    color: '#FFB703',
    label: 'Agricultural Burn',
  },
  gas_flare: {
    color: '#9333EA',
    label: 'Gas Flare Stack',
  },
  mining: {
    color: '#00E676',
    label: 'Mining / Smelter',
  },
  unknown: {
    color: '#94A3B8',
    label: 'Unclassified Anomaly',
  },
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

  const [activeTile, setActiveTile] = useState<'satellite' | 'dark'>(
    'satellite'
  );

  const [thermalPalette, setThermalPalette] = useState<
    'inferno' | 'ironbow' | 'whitehot' | 'normal'
  >('inferno');

  const [hudOverlay, setHudOverlay] = useState(true);
  const [laserScan, setLaserScan] = useState(true);

  const [selectedRegion, setSelectedRegion] = useState(
    'Durgapur Industrial Belt (IN)'
  );

  const currentHotspot =
    selectedHotspot || (hotspots.length > 0 ? hotspots[0] : null);

  /*
   * ============================================================
   * LEAFLET MAP INITIALIZATION
   * ============================================================
   */

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

    /*
     * Satellite imagery from Esri.
     */
    const satelliteLayer = L.tileLayer(
      MAP_TILE_PROVIDERS.satellite,
      {
        maxZoom: 19,
        attribution: '&copy; Esri',
      }
    );

    satelliteLayer.addTo(map);

    baseTileLayerRef.current = satelliteLayer;

    /*
     * Layer that contains all thermal hotspot markers.
     */
    const markers = L.layerGroup();

    markers.addTo(map);

    markersLayerRef.current = markers;

    /*
     * Leaflet needs the final size of the container.
     * The dashboard uses responsive flex/grid layouts, so
     * invalidateSize after rendering.
     */
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

  /*
   * ============================================================
   * CHANGE MAP TILE
   * ============================================================
   */

  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = baseTileLayerRef.current;

    if (!map || !layer) return;

    layer.setUrl(MAP_TILE_PROVIDERS[activeTile]);

    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [activeTile]);

  /*
   * ============================================================
   * HOTSPOT MARKERS
   * ============================================================
   */

  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    hotspots.forEach((hs) => {
      const classification =
        hs.assessment?.classification || 'unknown';

      const colorInfo =
        CLASS_COLORS[classification] || CLASS_COLORS.unknown;

      const isSelected =
        selectedHotspot?.id === hs.id;

      const isHighRisk =
        (hs.assessment?.industrialRisk ?? 0) >= 0.72 ||
        classification === 'wildfire';

      const baseSize = Math.min(
        32,
        Math.max(
          16,
          Math.round(16 + (hs.frpMW / 250) * 16)
        )
      );

      const size = isSelected
        ? baseSize + 8
        : baseSize;

      const icon = L.divIcon({
        className: 'tactical-drone-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],

        html: `
          <div
            style="
              position:relative;
              width:${size}px;
              height:${size}px;
              display:flex;
              align-items:center;
              justify-content:center;
            "
          >

            <div
              style="
                position:absolute;
                inset:-${isSelected ? 12 : 6}px;
                border-radius:50%;
                background:${colorInfo.color};
                opacity:${isSelected ? 0.7 : isHighRisk ? 0.5 : 0.3};
                filter:blur(${isSelected ? 8 : 4}px);
                ${
                  isHighRisk
                    ? 'animation:gradient-pulse 1.8s infinite;'
                    : ''
                }
              "
            ></div>

            ${
              isSelected
                ? `
                  <div
                    style="
                      position:absolute;
                      width:${size + 16}px;
                      height:${size + 16}px;
                      border:2px dashed #FF007A;
                      border-radius:8px;
                      animation:spin 10s linear infinite;
                    "
                  ></div>
                `
                : ''
            }

            <div
              style="
                width:${size}px;
                height:${size}px;
                border-radius:50%;
                background:${colorInfo.color};
                border:2px solid white;
                box-shadow:0 0 16px ${colorInfo.color};
                display:flex;
                align-items:center;
                justify-content:center;
              "
            >
              <div
                style="
                  width:4px;
                  height:4px;
                  border-radius:50%;
                  background:white;
                "
              ></div>
            </div>

          </div>
        `,
      });

      const marker = L.marker(
        [hs.latitude, hs.longitude],
        {
          icon,
        }
      );

      marker.on('click', () => {
        onSelectHotspot(hs);
      });

      marker.addTo(markersLayer);
    });
  }, [hotspots, selectedHotspot, onSelectHotspot]);

  /*
   * ============================================================
   * FOLLOW SELECTED HOTSPOT
   * ============================================================
   */

  useEffect(() => {
    const map = mapInstanceRef.current;

    if (!map || !selectedHotspot) return;

    map.flyTo(
      [
        selectedHotspot.latitude,
        selectedHotspot.longitude,
      ],
      11,
      {
        duration: 1.2,
      }
    );
  }, [selectedHotspot]);

  /*
   * ============================================================
   * REGION SELECTOR
   * ============================================================
   */

  const handleRegionChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const regionName = e.target.value;

    setSelectedRegion(regionName);

    const target = REGION_PRESETS.find(
      (region) => region.name === regionName
    );

    if (!target || !mapInstanceRef.current) return;

    mapInstanceRef.current.flyTo(
      [target.lat, target.lon],
      target.zoom,
      {
        duration: 1.4,
      }
    );
  };

  /*
   * ============================================================
   * RECENTER
   * ============================================================
   */

  const handleRecenterTarget = () => {
    if (!mapInstanceRef.current || !currentHotspot) return;

    mapInstanceRef.current.flyTo(
      [
        currentHotspot.latitude,
        currentHotspot.longitude,
      ],
      12,
      {
        duration: 1,
      }
    );
  };

  /*
   * ============================================================
   * THERMAL FILTER
   * ============================================================
   */

  const thermalFilterStyle =
    thermalPalette === 'inferno'
      ? 'contrast(1.15) brightness(0.95) saturate(1.45)'
      : thermalPalette === 'ironbow'
      ? 'hue-rotate(240deg) saturate(1.5) contrast(1.2)'
      : thermalPalette === 'whitehot'
      ? 'grayscale(1) contrast(1.5) brightness(1.05)'
      : 'none';

  return (
    <div
      className="
        virevo-card
        relative
        flex
        flex-col
        overflow-hidden
        border
        border-white/10
        shadow-[0_20px_60px_rgba(0,0,0,0.85)]
        min-h-[480px]
        sm:min-h-[540px]
        w-full
      "
    >

      {/* ======================================================
          TOP HUD
      ====================================================== */}

      <div
        className="
          absolute
          top-3.5
          left-4
          right-4
          z-[1000]
          flex
          flex-wrap
          items-center
          justify-between
          gap-2
          pointer-events-none
        "
      >

        <div
          className="
            pointer-events-auto
            flex
            items-center
            gap-2.5
            rounded-full
            border
            border-white/10
            bg-black/80
            px-4
            py-1.5
            backdrop-blur-xl
            shadow-lg
          "
        >
          <span className="flex h-2 w-2 rounded-full bg-[#FF007A] animate-ping" />

          <span className="font-mono text-[10px] uppercase font-extrabold tracking-wider text-white">
            DRONE CAM · GIS SATELLITE
          </span>

          <span className="text-slate-600">
            |
          </span>

          <span className="font-mono text-[10px] text-slate-300">
            {currentHotspot
              ? `${currentHotspot.latitude.toFixed(4)}°, ${currentHotspot.longitude.toFixed(4)}°`
              : 'IDLE PATROL'}
          </span>
        </div>

        <div
          className="
            pointer-events-auto
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-white/10
            bg-black/80
            p-1
            backdrop-blur-xl
          "
        >

          <div className="flex items-center gap-1 px-2.5 py-0.5 text-xs">

            <Compass
              size={12}
              className="text-[#FF5722]"
            />

            <select
              value={selectedRegion}
              onChange={handleRegionChange}
              className="
                bg-transparent
                text-[10px]
                font-mono
                font-semibold
                text-slate-200
                outline-none
                cursor-pointer
              "
            >
              {REGION_PRESETS.map((region) => (
                <option
                  key={region.name}
                  value={region.name}
                  className="bg-slate-900 text-white"
                >
                  {region.name}
                </option>
              ))}
            </select>

          </div>

          <div
            className="
              flex
              items-center
              gap-0.5
              bg-black/70
              rounded-full
              p-0.5
              border
              border-white/5
            "
          >

            <button
              onClick={() => setActiveTile('satellite')}
              className={`
                rounded-full
                px-3
                py-0.5
                text-[10px]
                font-mono
                font-bold
                transition-all
                ${
                  activeTile === 'satellite'
                    ? 'bg-virevo-gradient text-white'
                    : 'text-slate-400'
                }
              `}
            >
              Satellite
            </button>

            <button
              onClick={() => setActiveTile('dark')}
              className={`
                rounded-full
                px-3
                py-0.5
                text-[10px]
                font-mono
                font-bold
                transition-all
                ${
                  activeTile === 'dark'
                    ? 'bg-virevo-gradient text-white'
                    : 'text-slate-400'
                }
              `}
            >
              Dark HUD
            </button>

          </div>

        </div>

      </div>

      {/* ======================================================
          GIS MAP
      ====================================================== */}

      <div
        className="
          relative
          w-full
          h-[480px]
          sm:h-[540px]
          overflow-hidden
          bg-[#07090F]
        "
      >

        {/* REAL LEAFLET MAP */}

        <div
          ref={mapContainerRef}
          className="absolute inset-0"
          style={{
            filter: thermalFilterStyle,
          }}
        />

        {/* ==================================================
            LASER SCAN
        ================================================== */}

        {laserScan && (
          <div className="pointer-events-none absolute inset-0 z-[500] flex items-center justify-center">

            <div
              className="
                absolute
                top-1/6
                w-0
                h-0
                border-l-[160px]
                border-r-[160px]
                border-b-[300px]
                border-l-transparent
                border-r-transparent
                border-b-[#FF007A]/20
                filter
                blur-sm
                opacity-70
                animate-pulse
              "
              style={{
                clipPath:
                  'polygon(50% 0%, 0% 100%, 100% 100%)',
              }}
            />

            <div
              className="
                absolute
                top-1/6
                w-0
                h-0
                border-l-[110px]
                border-r-[110px]
                border-b-[240px]
                border-l-transparent
                border-r-transparent
                border-b-[#FF5722]/30
                opacity-80
                animate-laser-scan
              "
            />

          </div>
        )}

        {/* ==================================================
            CENTER HUD
        ================================================== */}

        {hudOverlay && (
          <div className="pointer-events-none absolute inset-0 z-[600] flex items-center justify-center">

            <div className="relative flex items-center justify-center">

              <div className="h-44 w-44 rounded-full border border-white/20 border-dashed animate-spin-slow opacity-60" />

              <div className="absolute h-32 w-32 rounded-full border border-[#FF007A]/40 opacity-70" />

              <div className="absolute h-24 w-24 border-t-2 border-l-2 border-[#FF007A] -top-2 -left-2" />

              <div className="absolute h-24 w-24 border-t-2 border-r-2 border-[#FF007A] -top-2 -right-2" />

              <div className="absolute h-24 w-24 border-b-2 border-l-2 border-[#FFB703] -bottom-2 -left-2" />

              <div className="absolute h-24 w-24 border-b-2 border-r-2 border-[#FFB703] -bottom-2 -right-2" />

              <div className="absolute h-4 w-4 rounded-full border-2 border-[#FF007A] shadow-[0_0_12px_#FF007A] flex items-center justify-center">

                <div className="h-1 w-1 rounded-full bg-white" />

              </div>

            </div>

          </div>
        )}

        {/* ==================================================
            ACTIVE TARGET
        ================================================== */}

        <div
          className="
            pointer-events-auto
            absolute
            top-20
            right-6
            z-[900]
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-white/20
            bg-black/85
            px-4
            py-2
            text-white
            shadow-[0_0_30px_rgba(255,0,122,0.4)]
            backdrop-blur-xl
          "
        >

          <span className="flex h-2.5 w-2.5 rounded-full bg-[#FF007A] animate-ping" />

          <div className="text-left">

            <span className="text-[10px] uppercase font-black font-mono tracking-wider block leading-none text-[#FF2A6D]">
              Active Flame Detected
            </span>

            <span className="text-[9px] text-slate-300 font-mono">
              FRP: {currentHotspot?.frpMW?.toFixed(1) || '64.2'} MW
              {' · '}
              {currentHotspot?.locationName || 'Target Sector'}
            </span>

          </div>

        </div>

        {/* ==================================================
            THERMAL CORE
        ================================================== */}

        <div
          className="
            pointer-events-auto
            absolute
            bottom-16
            right-6
            z-[900]
            flex
            items-center
            gap-2
            rounded-2xl
            border
            border-white/15
            bg-black/90
            px-3.5
            py-1.5
            text-white
            backdrop-blur-xl
            shadow-lg
          "
        >

          <Flame
            size={13}
            className="text-[#FFB703] animate-pulse"
          />

          <span className="text-[10px] uppercase font-bold font-mono">
            Radiance:{' '}
            {currentHotspot?.brightnessK?.toFixed(1) || '368.4'}
            {' K · '}
            {currentHotspot?.country || 'Surveillance Grid'}
          </span>

        </div>

        {/* ==================================================
            MAP CONTROLS
        ================================================== */}

        <div
          className="
            pointer-events-auto
            absolute
            bottom-16
            left-6
            z-[900]
            flex
            flex-col
            gap-1.5
          "
        >

          <button
            onClick={handleRecenterTarget}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-black/90
              text-white
              hover:bg-virevo-gradient
              transition-all
              shadow-md
            "
            title="Recenter on active target"
          >
            <Target size={15} />
          </button>

          <button
            onClick={() =>
              mapInstanceRef.current?.zoomIn()
            }
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-black/90
              text-slate-300
              hover:text-white
              transition-all
              shadow-md
            "
            title="Zoom in"
          >
            <ZoomIn size={15} />
          </button>

          <button
            onClick={() =>
              mapInstanceRef.current?.zoomOut()
            }
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-xl
              border
              border-white/10
              bg-black/90
              text-slate-300
              hover:text-white
              transition-all
              shadow-md
            "
            title="Zoom out"
          >
            <ZoomOut size={15} />
          </button>

        </div>

        {/* ==================================================
            BOTTOM HUD
        ================================================== */}

        <div
          className="
            pointer-events-auto
            absolute
            bottom-3.5
            left-4
            right-4
            z-[900]
            flex
            flex-wrap
            items-center
            justify-between
            gap-2
            rounded-2xl
            border
            border-white/10
            bg-black/90
            px-4
            py-2
            font-mono
            text-[10px]
            text-slate-300
            backdrop-blur-xl
            shadow-xl
          "
        >

          <div className="flex items-center gap-3">

            <span className="text-[#FF2A6D] font-bold flex items-center gap-1">

              <span className="h-1.5 w-1.5 rounded-full bg-[#FF007A] animate-ping" />

              REC [4K IR]

            </span>

            <span className="text-slate-600">
              |
            </span>

            <span>
              ALT: 120M
            </span>

            <span className="text-slate-600">
              |
            </span>

            <span>
              ZOOM: 3.5X OPTICAL
            </span>

            <span className="text-slate-600">
              |
            </span>

            <span>
              GIMBAL: -45° PITCH
            </span>

          </div>

          {/* IR PALETTE */}

          <div className="flex items-center gap-1.5">

            <span className="text-slate-400 text-[9px] uppercase">
              IR Palette:
            </span>

            <div
              className="
                flex
                items-center
                gap-1
                bg-black/80
                rounded-full
                p-0.5
                border
                border-white/10
              "
            >

              <button
                onClick={() =>
                  setThermalPalette('inferno')
                }
                className={`
                  px-2.5
                  py-0.5
                  rounded-full
                  text-[9px]
                  font-bold
                  transition-all
                  ${
                    thermalPalette === 'inferno'
                      ? 'bg-virevo-gradient text-white'
                      : 'text-slate-400'
                  }
                `}
              >
                Inferno
              </button>

              <button
                onClick={() =>
                  setThermalPalette('ironbow')
                }
                className={`
                  px-2.5
                  py-0.5
                  rounded-full
                  text-[9px]
                  font-bold
                  transition-all
                  ${
                    thermalPalette === 'ironbow'
                      ? 'bg-virevo-gradient text-white'
                      : 'text-slate-400'
                  }
                `}
              >
                Ironbow
              </button>

              <button
                onClick={() =>
                  setThermalPalette('whitehot')
                }
                className={`
                  px-2.5
                  py-0.5
                  rounded-full
                  text-[9px]
                  font-bold
                  transition-all
                  ${
                    thermalPalette === 'whitehot'
                      ? 'bg-virevo-gradient text-white'
                      : 'text-slate-400'
                  }
                `}
              >
                WhiteHot
              </button>

              <button
                onClick={() =>
                  setThermalPalette('normal')
                }
                className={`
                  px-2.5
                  py-0.5
                  rounded-full
                  text-[9px]
                  font-bold
                  transition-all
                  ${
                    thermalPalette === 'normal'
                      ? 'bg-virevo-gradient text-white'
                      : 'text-slate-400'
                  }
                `}
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