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
  CheckCircle,
  Radio,
  Navigation,
  Compass,
  Sliders,
  Search,
  Maximize2,
  TrendingUp,
  Flame,
  Clock
} from 'lucide-react';
import {
  ComponentThermalItem,
  computeThermalHazardScore,
  computeThermalTrendPrediction
} from './ComponentHotspotInspector';

interface ComponentNode3D extends ComponentThermalItem {
  lat: number;
  lon: number;
  locationLabel: string;
  recAction: string;
  aiDiag: string;
  satType: string;
  signalQuality: string;
  frequencyMHz: number;
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
    aiDiag: 'Possible power-load anomaly & high dielectric stress.',
    recAction: 'Reduce non-essential load immediately.',
    satType: 'Power Bus Satellite Node Alpha',
    signalQuality: '99.4%',
    frequencyMHz: 433.92
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
    recAction: 'Throttle core frequency by 15% and balance worker threads.',
    satType: 'High-Performance Orbital Server',
    signalQuality: '98.1%',
    frequencyMHz: 868.10
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
    recAction: 'Engage auxiliary pump manifold to equalize pressure gradient.',
    satType: 'Cooling Array Satellite Node',
    signalQuality: '96.8%',
    frequencyMHz: 915.00
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
    recAction: 'Maintain steady trickle charge state. No intervention required.',
    satType: 'Energy Cell Storage Satellite',
    signalQuality: '100%',
    frequencyMHz: 434.00
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
    recAction: 'Normal operational orientation. Sun tracking active.',
    satType: 'PV Array Orbital Harvester',
    signalQuality: '99.9%',
    frequencyMHz: 2400.00
  }
];

export const Interactive3DSatelliteMap: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<ComponentNode3D>(ORBIT_NODES[0]);
  const [rotation, setRotation] = useState({ rx: 0.25, ry: 0.8 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });

  // Live calculations
  const delta = (selectedNode.currentTempC - selectedNode.baselineTempC).toFixed(1);
  const hazardScore = computeThermalHazardScore(selectedNode);
  const trend = computeThermalTrendPrediction(selectedNode, 100);

  // Status helper
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

  // 3D Canvas rendering loop for CyberDefend Satellite Globe
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
      const radius = Math.min(width, height) * 0.36;

      // Draw Earth Night-side Atmosphere Glow (CyberDefend visual aesthetic)
      const atmosphericGlow = ctx.createRadialGradient(cx, cy, radius * 0.7, cx, cy, radius * 1.5);
      atmosphericGlow.addColorStop(0, 'rgba(56, 189, 248, 0.18)');
      atmosphericGlow.addColorStop(0.5, 'rgba(14, 165, 233, 0.08)');
      atmosphericGlow.addColorStop(1, 'rgba(2, 6, 23, 0)');
      ctx.fillStyle = atmosphericGlow;
      ctx.fillRect(0, 0, width, height);

      // Draw Earth Globe Surface Gradient
      const globeGrad = ctx.createRadialGradient(
        cx - radius * 0.35,
        cy - radius * 0.35,
        radius * 0.1,
        cx,
        cy,
        radius
      );
      globeGrad.addColorStop(0, '#0f2636');
      globeGrad.addColorStop(0.5, '#091522');
      globeGrad.addColorStop(0.9, '#030811');
      globeGrad.addColorStop(1, '#010307');

      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = globeGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw Orbital Ring Constellation Lines (Floating satellite orbit paths)
      const numOrbits = 3;
      for (let i = 0; i < numOrbits; i++) {
        const orbitRadius = radius * (1.18 + i * 0.12);
        const tilt = (i - 1) * 0.35 + rotation.rx * 0.4;
        ctx.beginPath();
        ctx.ellipse(cx, cy, orbitRadius, orbitRadius * Math.abs(Math.sin(tilt + 0.5)), tilt, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(56, 189, 248, ${0.18 - i * 0.04})`;
        ctx.lineWidth = 1;
        ctx.setLineDash([6, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Latitude / Longitude 3D Mesh
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.lineWidth = 1;

      // Latitude Parallels
      for (let lat = -60; lat <= 60; lat += 20) {
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

      // Longitude Meridians
      for (let lon = 0; lon < 360; lon += 30) {
        const radLon = ((lon + rotation.ry * 40) * Math.PI) / 180;
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

      // Render 3D Component / Satellite Nodes & Telemetry Pin Cards
      ORBIT_NODES.forEach((node) => {
        const phi = (90 - node.lat) * (Math.PI / 180);
        const theta = (node.lon * (Math.PI / 180)) + rotation.ry;

        const x3d = radius * Math.sin(phi) * Math.cos(theta);
        const y3d = radius * Math.cos(phi);
        const z3d = radius * Math.sin(phi) * Math.sin(theta);

        const yRot = y3d * Math.cos(rotation.rx) - z3d * Math.sin(rotation.rx);
        const zRot = y3d * Math.sin(rotation.rx) + z3d * Math.cos(rotation.rx);

        // Visible front hemisphere
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

          // Outer heat halo
          ctx.beginPath();
          ctx.arc(px, py, isSelected ? 18 : 10, 0, Math.PI * 2);
          ctx.fillStyle = markerColor;
          ctx.globalAlpha = isSelected ? 0.35 : 0.2;
          ctx.fill();
          ctx.globalAlpha = 1.0;

          // Solid core marker pin
          ctx.beginPath();
          ctx.arc(px, py, isSelected ? 6 : 4, 0, Math.PI * 2);
          ctx.fillStyle = markerColor;
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Dotted radar lock ring
          if (isSelected) {
            ctx.beginPath();
            ctx.arc(px, py, 22, 0, Math.PI * 2);
            ctx.strokeStyle = markerColor;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
          }

          // CyberDefend Satellite Label Tag Card
          ctx.fillStyle = 'rgba(5, 12, 22, 0.85)';
          ctx.strokeStyle = isSelected ? markerColor : 'rgba(56, 189, 248, 0.3)';
          ctx.lineWidth = 1;

          const labelText = node.name;
          ctx.font = 'bold 10px monospace';
          const textWidth = ctx.measureText(labelText).width;

          const boxX = px + 12;
          const boxY = py - 12;
          const boxW = textWidth + 16;
          const boxH = 22;

          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxW, boxH, 4);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
          ctx.fillText(labelText, boxX + 8, boxY + 14);
        }
      });

      // Continuous slow orbital rotation
      if (!isDraggingRef.current) {
        setRotation((prev) => ({ ...prev, ry: prev.ry + 0.0006 }));
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [rotation, selectedNode]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMouseRef.current.x;
    const dy = e.clientY - lastMouseRef.current.y;

    setRotation((prev) => ({
      rx: Math.max(-1.2, Math.min(1.2, prev.rx + dy * 0.0015)),
      ry: prev.ry + dx * 0.0015
    }));

    lastMouseRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  return (
    <div className="min-h-screen bg-[#040810] text-slate-100 font-sans p-4 sm:p-6 space-y-6">
      {/* 🚀 CYBERDEFEND TOP COMMAND BAR (Matches Dribbble UI Layout) */}
      <header className="flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-800/80 bg-[#08101d]/90 p-4 rounded-2xl backdrop-blur-xl shadow-2xl">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
            <Globe className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider text-white flex items-center gap-2 font-mono">
              CYBERDEFEND <span className="text-cyan-400 font-normal text-xs">SATELLITE INTELLIGENCE</span>
            </h1>
            <p className="text-[11px] text-slate-400">
              Real-time LEO thermal constellation monitoring & orbital anomaly tracking dashboard.
            </p>
          </div>
        </div>

        {/* Center Pill Nav */}
        <div className="flex items-center gap-1.5 bg-[#03060c] p-1.5 rounded-full border border-slate-800 font-mono text-xs">
          <button className="px-4 py-1.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
            Overview
          </button>
          <button className="px-4 py-1.5 rounded-full text-slate-400 hover:text-white transition-colors">
            Thermal
          </button>
          <button className="px-4 py-1.5 rounded-full text-slate-400 hover:text-white transition-colors">
            Alerts
          </button>
          <button className="px-4 py-1.5 rounded-full text-slate-400 hover:text-white transition-colors">
            Attacks
          </button>
        </div>

        {/* Right Tool Buttons */}
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
            <Search className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
            <Sliders className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 🌌 MAIN DRIBBBLE 3-PANEL LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ========================================================
         * LEFT SIDEBAR: SATELLITE FEED & FILTERS
         * ======================================================== */}
        <div className="lg:col-span-3 space-y-4">
          {/* Top Orbit Feeder Camera Thumbnail Card */}
          <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#08101d] p-3 shadow-xl">
            <div className="relative h-40 w-full overflow-hidden rounded-xl bg-slate-950 border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?q=80&w=800&auto=format&fit=crop"
                alt="Orbital Satellite Feed"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/70 px-2.5 py-1 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
                <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                <span>TSO: 09.28.112</span>
              </div>
              <div className="absolute bottom-2 left-2 right-2 bg-slate-950/85 p-2 rounded-lg border border-slate-800/80 font-mono text-[10px] text-slate-300 flex justify-between items-center backdrop-blur-md">
                <span>SAT-Beam-01 [1296x768]</span>
                <span className="text-amber-400 font-bold">220 Mbps</span>
              </div>
            </div>
          </div>

          {/* Subsystem Component Node Buttons */}
          <div className="rounded-2xl border border-slate-800 bg-[#08101d] p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 font-mono text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider">Subsystem Assets</span>
              <span className="text-[10px] text-cyan-400 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
                {ORBIT_NODES.length} ACTIVE
              </span>
            </div>

            <div className="space-y-2">
              {ORBIT_NODES.map((node) => {
                const isSelected = node.id === selectedNode.id;
                const badge = getStatusBadge(node.status);
                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-mono transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-500/40 text-white shadow-[0_0_15px_rgba(56,189,248,0.15)]'
                        : 'bg-[#03060c] border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {node.icon}
                      <span className="font-bold">{node.name}</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                      {node.currentTempC}°C
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========================================================
         * CENTER STAGE: 3D CYBERDEFEND EARTH GLOBE CANVAS
         * ======================================================== */}
        <div className="lg:col-span-6 relative rounded-2xl border border-slate-800 bg-[#060c17] min-h-[560px] flex flex-col justify-between overflow-hidden shadow-2xl">
          {/* Floating HUD Top Overlay */}
          <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-slate-800 bg-[#040810]/85 px-3 py-1.5 font-mono text-xs text-cyan-300 backdrop-blur-md">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>ORBIT: LEO 547km</span>
            </div>
            <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-slate-800 bg-[#040810]/85 px-3 py-1.5 font-mono text-xs text-amber-400 backdrop-blur-md">
              <Sun className="w-3.5 h-3.5" />
              <span>SUNLIGHT: HIGH</span>
            </div>
          </div>

          {/* Interactive 3D Canvas */}
          <div
            className="relative flex-1 cursor-grab active:cursor-grabbing flex items-center justify-center min-h-[460px]"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas ref={canvasRef} className="w-full h-full min-h-[460px]" />

            {/* Futuristic Orbit Ring Control Indicator */}
            <div className="pointer-events-none absolute bottom-4 right-4 z-10">
              <div className="w-16 h-16 rounded-full border-2 border-cyan-500/30 flex items-center justify-center bg-cyan-950/20 backdrop-blur-md">
                <div className="w-8 h-8 rounded-full border border-cyan-400/50 flex items-center justify-center text-[9px] font-mono text-cyan-300">
                  3D
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Satellite Telemetry Control Bar */}
          <div className="border-t border-slate-800/80 bg-[#040810]/95 p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Current Speed</span>
              <span className="text-sm font-extrabold text-white">7.6 km/s</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Target Speed</span>
              <span className="text-sm font-extrabold text-cyan-300">27k km/h</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Targets Detected</span>
              <span className="text-sm font-extrabold text-amber-400">2 Satellites</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block uppercase">Next Eclipse</span>
              <span className="text-sm font-extrabold text-indigo-300">11m 42s</span>
            </div>
          </div>
        </div>

        {/* ========================================================
         * RIGHT SIDEBAR: SATELLITE CARD HUD (Matches Dribbble Card)
         * ======================================================== */}
        <div className="lg:col-span-3 space-y-4">
          {/* Main Floating Satellite Component Detail Card */}
          <div className="rounded-2xl border border-cyan-500/30 bg-[#08101d] p-5 space-y-4 shadow-[0_0_30px_rgba(56,189,248,0.15)] relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                {selectedNode.icon}
                <h3 className="font-extrabold font-mono text-white text-sm tracking-wide">
                  {selectedNode.name}
                </h3>
              </div>
              <span className={`text-[10px] font-extrabold font-mono px-2.5 py-0.5 rounded border ${getStatusBadge(selectedNode.status).bg}`}>
                {selectedNode.status}
              </span>
            </div>

            {/* Satellite Render Preview Image */}
            <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center p-2">
              <img
                src="https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?q=80&w=800&auto=format&fit=crop"
                alt="Satellite Hardware preview"
                className="h-full w-full object-cover rounded-lg opacity-85"
              />
              <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 border border-cyan-500/30">
                Freq: {selectedNode.frequencyMHz} MHz
              </div>
            </div>

            {/* Exact Telemetry Values Grid */}
            <div className="grid grid-cols-2 gap-2 font-mono text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase">Temperature</span>
                <span className={`text-base font-black ${selectedNode.status === 'Critical' ? 'text-rose-400' : 'text-amber-400'}`}>
                  {selectedNode.currentTempC}°C
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase">Baseline</span>
                <span className="text-base font-bold text-slate-300">{selectedNode.baselineTempC}°C</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase">Deviation</span>
                <span className="text-sm font-extrabold text-rose-400">+{delta}°C</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase">Heating Rate</span>
                <span className="text-sm font-extrabold text-amber-400">+{selectedNode.heatingRateCMin}°C/min</span>
              </div>
            </div>

            {/* Signature Hazard Score (0-100) */}
            <div className="p-3 rounded-xl bg-slate-950 border border-rose-500/30 flex items-center justify-between">
              <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  THERMAL HAZARD SCORE
                </span>
                <div className="flex items-baseline gap-1 mt-0.5 font-mono">
                  <span className={`text-2xl font-black ${hazardScore.statusColor}`}>
                    {hazardScore.totalScore}
                  </span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
              </div>
              <span className={`text-xs font-black font-mono px-2.5 py-1 rounded border ${hazardScore.totalScore >= 80 ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse' : 'bg-amber-500/20 text-amber-300'}`}>
                {hazardScore.statusLabel}
              </span>
            </div>

            {/* AI Countermeasure Recommendation */}
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold text-[11px] uppercase">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Recommended Action</span>
              </div>
              <p className="p-2.5 rounded-lg bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-[11px] leading-relaxed">
                {selectedNode.recAction}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
       * BOTTOM TIME-SERIES ANOMALY WAVEFORM & CORRELATION ROW
       * ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table list */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#08101d] p-4 space-y-3 shadow-xl">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono block border-b border-slate-800 pb-2">
            Towers & Sector Nodes Active [4]
          </span>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  <th className="py-2 px-2">ID</th>
                  <th className="py-2 px-2">Location</th>
                  <th className="py-2 px-2">Load</th>
                  <th className="py-2 px-2 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="py-2 px-2 text-cyan-300 font-bold">TWR-001</td>
                  <td className="py-2 px-2">Portland, OR</td>
                  <td className="py-2 px-2 text-amber-400 font-bold">94%</td>
                  <td className="py-2 px-2 text-right text-rose-400 font-bold">CRITICAL</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-cyan-300 font-bold">MS-55</td>
                  <td className="py-2 px-2">Seattle, WA</td>
                  <td className="py-2 px-2">62%</td>
                  <td className="py-2 px-2 text-right text-amber-400 font-bold">ELEVATED</td>
                </tr>
                <tr>
                  <td className="py-2 px-2 text-cyan-300 font-bold">HFX-900</td>
                  <td className="py-2 px-2">San Francisco, CA</td>
                  <td className="py-2 px-2">38%</td>
                  <td className="py-2 px-2 text-right text-emerald-400 font-bold">NORMAL</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Time-Series Thermal Waveform Graph (Dribbble Chart) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#08101d] p-5 space-y-3 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
              CHANCE OF THERMAL ANOMALY BREACH (TIME-SERIES WAVEFORM)
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">
              LSTM / TRANSFORMER-TS REALTIME
            </span>
          </div>

          {/* Waveform Graphic Container */}
          <div className="relative h-32 w-full bg-slate-950/90 rounded-xl border border-slate-800/80 p-3 flex flex-col justify-between overflow-hidden">
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>200°C</span>
              <span>150°C</span>
              <span>100°C CRITICAL</span>
              <span>50°C</span>
            </div>

            {/* Glowing Waveform Curve */}
            <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 500 100">
              <path
                d="M 0 70 Q 70 20, 130 65 T 260 30 T 380 80 T 500 25"
                fill="none"
                stroke="url(#waveGradient)"
                strokeWidth="3"
              />
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="50%" stopColor="#fbbf24" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
              </defs>
            </svg>

            <div className="flex justify-between text-[10px] font-mono text-slate-400 relative z-10">
              <span>Los Angeles, CA</span>
              <span>Chicago, IL</span>
              <span>St. Louis, MO</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
