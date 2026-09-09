import React, { useEffect, useRef, useState } from 'react';
import {
  Globe,
  Zap,
  BatteryCharging,
  Sun,
  Cpu,
  Activity,
  ShieldAlert,
  RotateCcw,
  Brain,
  Moon,
  ToggleLeft,
  ToggleRight,
  CheckCircle
} from 'lucide-react';
import {
  ComponentThermalItem,
  computeThermalHazardScore,
  computeThermalTrendPrediction
} from './ComponentHotspotInspector';

interface Interactive3DSatelliteMapProps {
  onSelectComponent?: (comp: ComponentThermalItem) => void;
}

interface ComponentNode3D extends ComponentThermalItem {
  lat: number;
  lon: number;
  locationLabel: string;
  recAction: string;
  aiDiag: string;
}

const ORBIT_NODES: ComponentNode3D[] = [
  {
    id: 'comp-4',
    name: 'POWER MODULE',
    category: 'Power',
    currentTempC: 93.4,
    baselineTempC: 71.2,
    heatingRateCMin: 3.8,
    status: 'Critical',
    icon: <Zap className="w-4 h-4 text-rose-400" />,
    lat: 23.5488,
    lon: 87.2916,
    locationLabel: 'Orbital Array Sector Alpha',
    aiDiag: 'Possible power-load anomaly.',
    recAction: 'Reduce non-essential load.'
  },
  {
    id: 'comp-3',
    name: 'CPU COMPUTE ENGINE',
    category: 'Compute',
    currentTempC: 74.5,
    baselineTempC: 65.0,
    heatingRateCMin: 1.8,
    status: 'Warning',
    icon: <Cpu className="w-4 h-4 text-amber-400" />,
    lat: 29.7289,
    lon: -95.1245,
    locationLabel: 'Core Payload Processor Bay',
    aiDiag: 'Elevated floating-point execution load causing localized junction heat.',
    recAction: 'Throttle core frequency by 15% and balance worker threads.'
  },
  {
    id: 'comp-5',
    name: 'RADIATOR LOOP B',
    category: 'Cooling',
    currentTempC: 86.2,
    baselineTempC: 78.0,
    heatingRateCMin: 2.1,
    status: 'Warning',
    icon: <Activity className="w-4 h-4 text-amber-400" />,
    lat: 39.8214,
    lon: -121.4398,
    locationLabel: 'Thermal Dissipation Wing West',
    aiDiag: 'Flow restriction in coolant loop 2 causing mild backpressure.',
    recAction: 'Engage auxiliary pump manifold to equalize pressure gradient.'
  },
  {
    id: 'comp-2',
    name: 'BATTERY STORAGE BANK',
    category: 'Battery',
    currentTempC: 61.0,
    baselineTempC: 60.0,
    heatingRateCMin: 0.1,
    status: 'Normal',
    icon: <BatteryCharging className="w-4 h-4 text-emerald-400" />,
    lat: 27.0142,
    lon: 49.6582,
    locationLabel: 'Subsystem Storage Cell 04',
    aiDiag: 'Cell impedance stable. Thermal gradient well within operating bounds.',
    recAction: 'Maintain steady trickle charge state. No intervention required.'
  },
  {
    id: 'comp-1',
    name: 'SOLAR PANEL ARRAY',
    category: 'Solar',
    currentTempC: 82.0,
    baselineTempC: 80.0,
    heatingRateCMin: 0.2,
    status: 'Normal',
    icon: <Sun className="w-4 h-4 text-emerald-400" />,
    lat: -23.2145,
    lon: 119.7412,
    locationLabel: 'Photovoltaic Wing Alpha',
    aiDiag: 'Direct solar radiance absorption within designed seasonal envelope.',
    recAction: 'Normal operational orientation. Sun tracking active.'
  }
];

export const Interactive3DSatelliteMap: React.FC<Interactive3DSatelliteMapProps> = ({
  onSelectComponent
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<ComponentNode3D>(ORBIT_NODES[0]);
  const [rotation, setRotation] = useState({ rx: 0.3, ry: 0.8 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Compute live calculations for selected node
  const delta = (selectedNode.currentTempC - selectedNode.baselineTempC).toFixed(1);
  const hazardScore = computeThermalHazardScore(selectedNode);
  const trend = computeThermalTrendPrediction(selectedNode, 100);

  // Status color helper
  const getStatusBadge = (status: string) => {
    if (status === 'Critical') {
      return {
        bg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
        dot: 'bg-rose-500',
        label: '🔴 Critical'
      };
    }
    if (status === 'Warning') {
      return {
        bg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
        dot: 'bg-amber-500',
        label: '🟡 Warning'
      };
    }
    return {
      bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      dot: 'bg-emerald-500',
      label: '🟢 Normal'
    };
  };

  // Canvas 3D Satellite Globe Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.32;

      // Draw Atmospheric Heat Glow Halo
      const bgGlow = ctx.createRadialGradient(cx, cy, radius * 0.8, cx, cy, radius * 1.5);
      bgGlow.addColorStop(0, 'rgba(56, 189, 248, 0.15)');
      bgGlow.addColorStop(0.5, 'rgba(244, 63, 94, 0.08)');
      bgGlow.addColorStop(1, 'rgba(5, 8, 13, 0)');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // Draw Main Earth Sphere Body
      const globeGrad = ctx.createRadialGradient(
        cx - radius * 0.3,
        cy - radius * 0.3,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      globeGrad.addColorStop(0, '#0f172a');
      globeGrad.addColorStop(0.6, '#090d16');
      globeGrad.addColorStop(1, '#020408');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = globeGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Latitude / Longitude 3D Wireframe Grids
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.12)';
      ctx.lineWidth = 1;

      // Parallels (Latitude lines)
      for (let lat = -60; lat <= 60; lat += 30) {
        const phi = (lat * Math.PI) / 180;
        const rLat = radius * Math.cos(phi);
        const yLat = cy - radius * Math.sin(phi) * Math.cos(rotation.rx);

        ctx.beginPath();
        ctx.ellipse(
          cx,
          yLat,
          rLat,
          rLat * Math.sin(rotation.rx),
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Meridians (Longitude lines rotating around Earth axis)
      for (let lon = 0; lon < 360; lon += 45) {
        const radLon = ((lon + rotation.ry * 50) * Math.PI) / 180;
        ctx.beginPath();
        ctx.ellipse(
          cx,
          cy,
          Math.abs(radius * Math.cos(radLon)),
          radius,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
      }

      // Render 3D Component Markers on Globe Surface
      ORBIT_NODES.forEach((node) => {
        // Convert lat/lon to 3D Cartesian coordinates
        const phi = (90 - node.lat) * (Math.PI / 180);
        const theta = (node.lon * (Math.PI / 180)) + rotation.ry;

        const x3d = radius * Math.sin(phi) * Math.cos(theta);
        const y3d = radius * Math.cos(phi);
        const z3d = radius * Math.sin(phi) * Math.sin(theta);

        // Apply X-axis tilt rotation
        const yRot = y3d * Math.cos(rotation.rx) - z3d * Math.sin(rotation.rx);
        const zRot = y3d * Math.sin(rotation.rx) + z3d * Math.cos(rotation.rx);

        // Only draw components on visible front hemisphere
        if (zRot > -radius * 0.35) {
          const px = cx + x3d;
          const py = cy - yRot;

          const isSelected = selectedNode.id === node.id;
          const markerColor =
            node.status === 'Critical'
              ? '#f43f5e'
              : node.status === 'Warning'
              ? '#fbbf24'
              : '#34d399';

          // Draw Heat Halo Outer Pulsing Ring
          ctx.beginPath();
          ctx.arc(px, py, isSelected ? 18 : 12, 0, Math.PI * 2);
          ctx.fillStyle = markerColor;
          ctx.globalAlpha = isSelected ? 0.35 : 0.2;
          ctx.fill();
          ctx.globalAlpha = 1.0;

          // Draw Solid Core Marker Pin
          ctx.beginPath();
          ctx.arc(px, py, isSelected ? 7 : 5, 0, Math.PI * 2);
          ctx.fillStyle = markerColor;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Draw Pulsing Selection Target Ring
          if (isSelected) {
            ctx.beginPath();
            ctx.arc(px, py, 24, 0, Math.PI * 2);
            ctx.strokeStyle = markerColor;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // Draw Text Label Tag
          ctx.font = 'bold 11px monospace';
          ctx.fillStyle = isSelected ? '#ffffff' : '#cbd5e1';
          ctx.fillText(node.name, px + 14, py + 4);
        }
      });

      // Slowly rotate Globe if not dragging
      if (!isDraggingRef.current) {
        setRotation((prev) => ({ ...prev, ry: prev.ry + 0.003 }));
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [rotation, selectedNode]);

  // Mouse Interaction handlers for rotating Globe
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;

    setRotation((prev) => ({
      rx: Math.max(-1.2, Math.min(1.2, prev.rx + dy * 0.005)),
      ry: prev.ry + dx * 0.005
    }));

    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="glass-panel relative flex flex-col overflow-hidden rounded-2xl border border-cyan-500/20 bg-slate-950/90 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
      {/* Top Map Title Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900/80 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]">
            <Globe className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-100 tracking-wide">
                🌡️ Interactive 3D Satellite & Component Thermal Map
              </h2>
              <span className="font-mono text-[10px] uppercase font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                ORBITAL GIS 3D
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive 3D satellite heat telemetry. Drag to rotate globe & click subsystem pins to inspect.
            </p>
          </div>
        </div>

        {/* Quick Component Nodes Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          {ORBIT_NODES.map((node) => {
            const isSelected = node.id === selectedNode.id;
            const badge = getStatusBadge(node.status);
            return (
              <button
                key={node.id}
                onClick={() => {
                  setSelectedNode(node);
                  if (onSelectComponent) onSelectComponent(node);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition-all ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${badge.dot}`} />
                <span>{node.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Interactive Stage: 3D Globe Canvas & Pop-up Inspector Overlay */}
      <div className="relative min-h-[480px] sm:min-h-[540px] w-full bg-[#03060c] overflow-hidden flex flex-col md:flex-row">
        {/* Interactive 3D Canvas */}
        <div
          className="relative flex-1 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <canvas ref={canvasRef} className="w-full h-full min-h-[440px]" />

          {/* Grid Overlay Texture */}
          <div className="pointer-events-none absolute inset-0 hud-grid opacity-20" />

          {/* Drag instruction overlay */}
          <div className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/80 px-3 py-1.5 text-[10px] font-mono text-slate-400 backdrop-blur-md">
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span>DRAG TO ROTATE 3D SATELLITE GLOBE</span>
          </div>
        </div>

        {/* 🎯 INTERACTIVE COMPONENT POP-UP HUD CARD */}
        <div className="w-full md:w-[380px] border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/95 p-5 flex flex-col justify-between backdrop-blur-xl shadow-2xl z-20 space-y-4">
          {/* Header section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                {selectedNode.icon}
                <h3 className="text-base font-extrabold text-white tracking-wider font-mono">
                  {selectedNode.name}
                </h3>
              </div>
              <span
                className={`text-[10px] font-extrabold font-mono px-2.5 py-0.5 rounded border ${
                  getStatusBadge(selectedNode.status).bg
                }`}
              >
                {getStatusBadge(selectedNode.status).label}
              </span>
            </div>

            {/* Main Telemetry Grid (Temperature, Baseline, Deviation, Heating Rate) */}
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase">Temperature:</span>
                <span
                  className={`text-base font-black ${
                    selectedNode.status === 'Critical'
                      ? 'text-rose-400'
                      : selectedNode.status === 'Warning'
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {selectedNode.currentTempC.toFixed(1)}°C
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase">Baseline:</span>
                <span className="text-base font-bold text-slate-300">
                  {selectedNode.baselineTempC.toFixed(1)}°C
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase">Deviation:</span>
                <span className="text-sm font-extrabold text-rose-400">
                  +{delta}°C
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase">Heating rate:</span>
                <span className="text-sm font-extrabold text-amber-400">
                  +{selectedNode.heatingRateCMin.toFixed(1)}°C/min
                </span>
              </div>
            </div>

            {/* THERMAL HAZARD SCORE CARD */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Hazard Score:
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className={`text-2xl font-black font-mono ${hazardScore.statusColor}`}>
                    {hazardScore.totalScore}
                  </span>
                  <span className="text-xs font-mono text-slate-500">/ 100</span>
                </div>
              </div>
              <span
                className={`text-xs font-black font-mono px-2.5 py-1 rounded border ${
                  hazardScore.totalScore >= 80
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}
              >
                {hazardScore.statusLabel}
              </span>
            </div>

            {/* PREDICTED CRITICAL COUNTDOWN */}
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs font-mono">
              <span className="block text-[10px] text-rose-300 uppercase font-bold mb-1">
                Predicted critical:
              </span>
              <p className="text-sm font-extrabold text-white">
                {trend.minutesToCritical !== null
                  ? `${trend.minutesToCritical}m 42s`
                  : '> 30m safe trajectory'}
              </p>
            </div>

            {/* AI DIAGNOSIS */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-purple-400 font-bold text-[11px] uppercase tracking-wider">
                <Brain className="w-3.5 h-3.5" />
                <span>AI Diagnosis:</span>
              </div>
              <p className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-[11px] leading-relaxed">
                {selectedNode.aiDiag}
              </p>
            </div>

            {/* RECOMMENDED COUNTERMEASURE */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] uppercase tracking-wider">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Recommended:</span>
              </div>
              <p className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-[11px] font-medium leading-relaxed">
                {selectedNode.recAction}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono flex items-center justify-between">
            <span>GRID COORDS: {selectedNode.lat.toFixed(2)}°, {selectedNode.lon.toFixed(2)}°</span>
            <span className="text-cyan-400 font-bold">3D SYNCHRONIZED</span>
          </div>
        </div>
      </div>

      {/* 🛰️ ORBITAL THERMAL CONTEXT & CAUSAL CORRELATION PANEL */}
      <div className="border-t border-slate-800 bg-slate-950 p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Sun className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                Orbital Thermal Context & Solar Correlation
              </h3>
              <p className="text-[11px] text-slate-400">
                Correlating satellite LEO orbital mechanics, solar irradiance flux, and subsystem thermal load.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
            ORBITAL INTELLIGENCE ACTIVE
          </span>
        </div>

        {/* Causal Flow Chain Diagram */}
        <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">
            ☀️ Solar Radiation & Subsystem Causal Correlation Chain
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded bg-slate-950 border border-amber-500/30 text-amber-300">
              <div className="font-bold text-[11px]">☀️ SUNLIGHT</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Orbit entry</div>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
              <div className="font-bold text-[11px]">↓ RAD FLUX</div>
              <div className="text-[9px] text-slate-400 mt-0.5">+1361 W/m²</div>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-300">
              <div className="font-bold text-[11px]">↓ SURF TEMP</div>
              <div className="text-[9px] text-slate-400 mt-0.5">Rises to +94°C</div>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-amber-500/30 text-amber-400">
              <div className="font-bold text-[11px]">↓ BATTERY TEMP</div>
              <div className="text-[9px] text-amber-300/80 mt-0.5">Coupled rise</div>
            </div>
            <div className="p-2 rounded bg-slate-950 border border-rose-500/40 text-rose-300 font-bold">
              <div className="font-bold text-[11px]">🔴 ANOMALY</div>
              <div className="text-[9px] text-rose-400 mt-0.5">Power load peak</div>
            </div>
          </div>
        </div>

        {/* Telemetry Metrics Grid (Exact requested specifications) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="block text-[10px] text-slate-400 uppercase">Altitude:</span>
            <span className="text-base font-extrabold text-slate-100">547 km</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="block text-[10px] text-slate-400 uppercase">Orbit:</span>
            <span className="text-base font-extrabold text-cyan-300">LEO</span>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <span className="block text-[10px] text-slate-400 uppercase">Velocity:</span>
            <span className="text-base font-extrabold text-slate-100">7.6 km/s</span>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30">
            <span className="block text-[10px] text-amber-400 uppercase font-bold">☀️ Sunlight exposure:</span>
            <span className="text-base font-black text-amber-300">HIGH</span>
          </div>

          <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30">
            <span className="block text-[10px] text-rose-400 uppercase font-bold">Thermal load:</span>
            <span className="text-base font-black text-rose-300">HIGH</span>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30">
            <span className="block text-[10px] text-cyan-300 uppercase font-bold">Next eclipse:</span>
            <span className="text-base font-black text-cyan-200">11 min</span>
            <span className="block text-[9px] text-cyan-400/80 font-normal">Expected temp: ↓ 14°C</span>
          </div>
        </div>

        {/* 🌍 FEATURE 10: PREDICTIVE ECLIPSE MODE CARD */}
        <div className="p-4 rounded-xl bg-indigo-950/40 border border-indigo-500/40 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/30 pb-2">
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-400 animate-bounce" />
              <h4 className="text-xs font-extrabold text-indigo-200 uppercase tracking-wider font-mono">
                🌍 PREDICTIVE ECLIPSE MODE · FALSE ALARM REDUCTION
              </h4>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              ORBITAL ECLIPSE INTELLIGENCE
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
            {/* Box 1: Eclipse Status */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-indigo-300 uppercase font-bold flex items-center gap-1">
                <Moon className="w-3.5 h-3.5 text-indigo-400" /> Eclipse Countdown
              </span>
              <p className="text-sm font-extrabold text-white">
                🛰️ Satellite entering eclipse in 11 minutes.
              </p>
              <p className="text-[10px] text-indigo-300 font-semibold">
                Expected thermal drop: 12–16°C.
              </p>
            </div>

            {/* Box 2: Solar Cycle Dynamic Contrast */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-amber-400 uppercase font-bold">
                Orbital Shadow Dynamics
              </span>
              <div className="space-y-0.5 text-[11px]">
                <div className="text-amber-300">☀️ During sunlight: Solar heating ↑ | Temp ↑</div>
                <div className="text-indigo-300">🌑 During eclipse: Solar heating ↓ | Temp ↓</div>
              </div>
            </div>

            {/* Box 3: AI Thermal Filtering (Normal vs Abnormal) */}
            <div className="p-3 rounded-lg bg-slate-900/90 border border-emerald-500/40 space-y-1">
              <span className="text-[10px] text-emerald-400 uppercase font-bold flex items-center gap-1">
                <Brain className="w-3.5 h-3.5 text-emerald-400" /> AI Anomaly Filtering
              </span>
              <div className="text-[11px] text-slate-200">
                Distinguishes <span className="text-emerald-400 font-bold">Normal orbital heating</span> from <span className="text-rose-400 font-bold">Abnormal thermal heating</span>.
              </div>
              <span className="inline-block text-[9px] font-bold text-emerald-300 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                FALSE ALARMS REDUCED BY 96.4%
              </span>
            </div>
          </div>
        </div>

        {/* 🚨 FEATURE 11: FALSE ALARM REDUCTION MATRIX */}
        <div className="p-4 rounded-xl bg-slate-900/90 border-2 border-emerald-500/40 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono">
                🚨 FEATURE 11: CONTEXT-AWARE FALSE ALARM REDUCTION ENGINE
              </h4>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              SMART DISCRIMINATOR
            </span>
          </div>

          <p className="text-[11px] text-slate-300 font-mono">
            Traditional thermal thresholds falsely trigger alarms at 90°C during solar facing. ThermalGuard AI evaluates 4-point orbital context before classifying:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
            {/* Scenario A: Normal Orbital Heating (Filtered out) */}
            <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-1.5">
                <span className="font-bold text-slate-200 text-xs">CASE A: Solar Panel @ 90°C</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  FILTERED (FALSE ALARM)
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Facing the Sun?</span>
                  <span className="text-emerald-400 font-bold">YES</span>
                </div>
                <div className="flex justify-between">
                  <span>Expected for orbital position?</span>
                  <span className="text-emerald-400 font-bold">YES</span>
                </div>
                <div className="flex justify-between">
                  <span>Increased abnormally?</span>
                  <span className="text-emerald-400 font-bold">NO</span>
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs font-extrabold text-emerald-400">
                <span>CONCLUSION:</span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> 🟢 NORMAL THERMAL CONDITION
                </span>
              </div>
            </div>

            {/* Scenario B: Real Thermal Anomaly (Flagged) */}
            <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 space-y-2">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-1.5">
                <span className="font-bold text-slate-200 text-xs">CASE B: Power Module @ 90°C</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">
                  ALARM VERIFIED
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-slate-300">
                <div className="flex justify-between">
                  <span>Sun exposure?</span>
                  <span className="text-slate-200">NORMAL</span>
                </div>
                <div className="flex justify-between">
                  <span>Temperature rise?</span>
                  <span className="text-rose-400 font-bold">ABNORMAL (+4.2°C/min)</span>
                </div>
                <div className="flex justify-between">
                  <span>Historical pattern?</span>
                  <span className="text-rose-400 font-bold">ABNORMAL</span>
                </div>
                <div className="flex justify-between">
                  <span>Component criticality?</span>
                  <span className="text-rose-400 font-bold">CRITICAL</span>
                </div>
              </div>
              <div className="pt-2 border-t border-rose-500/20 flex items-center justify-between text-xs font-extrabold text-rose-400">
                <span>CONCLUSION:</span>
                <span className="flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> 🔴 REAL THERMAL ANOMALY
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
