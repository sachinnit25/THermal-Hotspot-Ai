import React, { useState } from 'react';
import {
  Flame,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Cpu,
  Zap,
  BatteryCharging,
  Sun,
  ShieldAlert,
  Play,
  RotateCcw,
  Plus,
  Activity,
  Sparkles
} from 'lucide-react';

export interface ComponentThermalItem {
  id: string;
  name: string;
  category: 'Solar' | 'Battery' | 'Compute' | 'Power' | 'Cooling' | 'Industrial';
  currentTempC: number;
  baselineTempC: number;
  heatingRateCMin: number;
  status: 'Normal' | 'Warning' | 'Critical';
  icon: React.ReactNode;
}

export function generateComponentAINarrative(item: ComponentThermalItem): {
  narrative: string;
  riskLevel: 'HIGH' | 'CRITICAL' | 'MODERATE' | 'LOW';
  tempDelta: number;
} {
  const tempDelta = Number((item.currentTempC - item.baselineTempC).toFixed(1));
  const rate = item.heatingRateCMin;

  let riskLevel: 'HIGH' | 'CRITICAL' | 'MODERATE' | 'LOW' = 'LOW';
  let riskText = 'NORMAL';

  if (tempDelta >= 15 || rate >= 3.5 || item.currentTempC >= 90) {
    riskLevel = 'CRITICAL';
    riskText = 'CRITICAL';
  } else if (tempDelta >= 10 || rate >= 2.0 || item.currentTempC >= 80) {
    riskLevel = 'HIGH';
    riskText = 'HIGH';
  } else if (tempDelta >= 5 || rate >= 1.0 || item.currentTempC >= 72) {
    riskLevel = 'MODERATE';
    riskText = 'MODERATE';
  }

  let narrative = '';
  if (tempDelta > 0) {
    narrative = `Thermal anomaly detected. ${item.name} temperature is ${tempDelta}°C above its predicted operating range. Heating rate has increased by +${rate.toFixed(1)}°C/min. Risk: ${riskText}.`;
  } else {
    narrative = `${item.name} operating within optimal thermal envelope (${item.currentTempC}°C). Heating rate stable at +${rate.toFixed(1)}°C/min. Risk: NORMAL.`;
  }

  return { narrative, riskLevel, tempDelta };
}

const INITIAL_COMPONENTS: ComponentThermalItem[] = [
  {
    id: 'comp-1',
    name: 'Solar Panel',
    category: 'Solar',
    currentTempC: 82,
    baselineTempC: 80,
    heatingRateCMin: 0.2,
    status: 'Normal',
    icon: <Sun className="w-4 h-4 text-emerald-400" />
  },
  {
    id: 'comp-2',
    name: 'Battery',
    category: 'Battery',
    currentTempC: 61,
    baselineTempC: 60,
    heatingRateCMin: 0.1,
    status: 'Normal',
    icon: <BatteryCharging className="w-4 h-4 text-emerald-400" />
  },
  {
    id: 'comp-3',
    name: 'CPU',
    category: 'Compute',
    currentTempC: 74,
    baselineTempC: 65,
    heatingRateCMin: 1.8,
    status: 'Warning',
    icon: <Cpu className="w-4 h-4 text-amber-400" />
  },
  {
    id: 'comp-4',
    name: 'Power Module',
    category: 'Power',
    currentTempC: 93,
    baselineTempC: 75,
    heatingRateCMin: 4.2,
    status: 'Critical',
    icon: <Zap className="w-4 h-4 text-rose-400" />
  },
  {
    id: 'comp-5',
    name: 'Radiator',
    category: 'Cooling',
    currentTempC: 86,
    baselineTempC: 78,
    heatingRateCMin: 2.1,
    status: 'Warning',
    icon: <Activity className="w-4 h-4 text-amber-400" />
  }
];

export function ComponentHotspotInspector() {
  const [components, setComponents] = useState<ComponentThermalItem[]>(INITIAL_COMPONENTS);
  const [selectedCompId, setSelectedCompId] = useState<string>('comp-4');
  const [isSimulatingStress, setIsSimulatingStress] = useState<boolean>(false);
  const [newCompName, setNewCompName] = useState<string>('');
  const [newCompTemp, setNewCompTemp] = useState<string>('85');
  const [newCompBaseline, setNewCompBaseline] = useState<string>('70');
  const [newCompRate, setNewCompRate] = useState<string>('2.5');

  const selectedComponent = components.find((c) => c.id === selectedCompId) || components[0];
  const selectedAiAnalysis = generateComponentAINarrative(selectedComponent);

  const handleSimulateStress = () => {
    setIsSimulatingStress(true);
    setTimeout(() => {
      setComponents((prev) =>
        prev.map((item) => {
          const tempIncrease = item.status === 'Critical' ? 4 : item.status === 'Warning' ? 2.5 : 1.2;
          const newTemp = Math.min(115, Math.round((item.currentTempC + tempIncrease) * 10) / 10);
          const newRate = Math.min(8.0, Math.round((item.heatingRateCMin + 0.4) * 10) / 10);
          const newStatus = newTemp >= 90 ? 'Critical' : newTemp >= 73 ? 'Warning' : 'Normal';
          return {
            ...item,
            currentTempC: newTemp,
            heatingRateCMin: newRate,
            status: newStatus
          };
        })
      );
      setIsSimulatingStress(false);
    }, 600);
  };

  const handleReset = () => {
    setComponents(INITIAL_COMPONENTS);
  };

  const handleAddComponent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompName.trim()) return;

    const temp = parseFloat(newCompTemp) || 75;
    const base = parseFloat(newCompBaseline) || 70;
    const rate = parseFloat(newCompRate) || 1.0;
    const status = temp >= 90 ? 'Critical' : temp >= 73 ? 'Warning' : 'Normal';

    const newItem: ComponentThermalItem = {
      id: `comp-${Date.now()}`,
      name: newCompName.trim(),
      category: 'Power',
      currentTempC: temp,
      baselineTempC: base,
      heatingRateCMin: rate,
      status,
      icon: <Zap className="w-4 h-4 text-amber-400" />
    };

    setComponents((prev) => [...prev, newItem]);
    setSelectedCompId(newItem.id);
    setNewCompName('');
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">
              🔥 Hardware & Subsystem Hotspot AI Engine
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time component thermal telemetry, baseline predictive delta ($ΔT$), and AI trajectory anomaly intelligence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateStress}
            disabled={isSimulatingStress}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-rose-950/40 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {isSimulatingStress ? 'Running Thermal Load...' : 'Simulate Thermal Stress'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Baseline
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Component Thermal Table */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-950/80 rounded-xl border border-slate-800/80 overflow-hidden shadow-inner">
            <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Telemetry Component Matrix
              </span>
              <span className="text-[10px] text-slate-400">5 Active Subsystems</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/30">
                    <th className="py-2.5 px-4 font-medium">Component</th>
                    <th className="py-2.5 px-4 font-medium">Temperature</th>
                    <th className="py-2.5 px-4 font-medium">Predicted Operating Baseline</th>
                    <th className="py-2.5 px-4 font-medium">Heating Rate</th>
                    <th className="py-2.5 px-4 font-medium text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {components.map((item) => {
                    const isSelected = item.id === selectedCompId;
                    const delta = item.currentTempC - item.baselineTempC;
                    return (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedCompId(item.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-500/10 border-l-4 border-l-amber-500'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="py-3 px-4 font-semibold text-slate-200">
                          <div className="flex items-center gap-2">
                            {item.icon}
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-100">
                          <span
                            className={
                              item.status === 'Critical'
                                ? 'text-rose-400'
                                : item.status === 'Warning'
                                ? 'text-amber-400'
                                : 'text-emerald-400'
                            }
                          >
                            {item.currentTempC}°C
                          </span>
                          {delta > 0 && (
                            <span className="ml-2 text-[10px] font-normal text-rose-400/90">
                              (+{delta.toFixed(1)}°C)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-400 font-mono">
                          {item.baselineTempC}°C
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono">
                          <div className="flex items-center gap-1 text-amber-400/90">
                            <TrendingUp className="w-3 h-3" />
                            <span>+{item.heatingRateCMin.toFixed(1)}°C/min</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {item.status === 'Normal' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <CheckCircle className="w-3 h-3" /> Normal
                            </span>
                          )}
                          {item.status === 'Warning' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <AlertTriangle className="w-3 h-3" /> Warning
                            </span>
                          )}
                          {item.status === 'Critical' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
                              <Flame className="w-3 h-3" /> Critical
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Add Custom Component Form */}
          <form onSubmit={handleAddComponent} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[120px]">
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                Component Name
              </label>
              <input
                type="text"
                placeholder="e.g. Inverter Module"
                value={newCompName}
                onChange={(e) => setNewCompName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
            <div className="w-20">
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                Temp (°C)
              </label>
              <input
                type="number"
                value={newCompTemp}
                onChange={(e) => setNewCompTemp(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
            <div className="w-24">
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                Baseline (°C)
              </label>
              <input
                type="number"
                value={newCompBaseline}
                onChange={(e) => setNewCompBaseline(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
            <div className="w-24">
              <label className="block text-[10px] text-slate-400 uppercase font-semibold mb-1">
                Rate (°C/min)
              </label>
              <input
                type="number"
                step="0.1"
                value={newCompRate}
                onChange={(e) => setNewCompRate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-slate-200 rounded px-2.5 py-1.5 text-xs focus:border-amber-500 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Component
            </button>
          </form>
        </div>

        {/* Right Column: AI Intelligence Reasoning Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-5 rounded-xl border border-amber-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles className="w-32 h-32 text-amber-400" />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                AI Anomaly Narrative Output
              </h3>
            </div>

            <div className="bg-slate-900/90 border border-amber-500/20 rounded-lg p-4 mb-4 shadow-inner">
              <p className="text-xs font-mono text-slate-100 leading-relaxed">
                "{selectedAiAnalysis.narrative}"
              </p>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase font-medium mb-0.5">
                  Target Component
                </span>
                <span className="font-bold text-slate-200">{selectedComponent.name}</span>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase font-medium mb-0.5">
                  Delta vs Baseline
                </span>
                <span
                  className={`font-mono font-bold ${
                    selectedAiAnalysis.tempDelta > 0 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  +{selectedAiAnalysis.tempDelta}°C
                </span>
              </div>

              <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800">
                <span className="block text-[10px] text-slate-400 uppercase font-medium mb-0.5">
                  Calculated Risk
                </span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    selectedAiAnalysis.riskLevel === 'CRITICAL'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : selectedAiAnalysis.riskLevel === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {selectedAiAnalysis.riskLevel}
                </span>
              </div>
            </div>

            {/* Diagnostic Insight Box */}
            <div className="mt-4 p-3 bg-slate-900/50 rounded border border-slate-800 text-[11px] text-slate-300">
              <span className="font-semibold text-amber-400 block mb-1">
                💡 Intelligence Diagnosis Rationale:
              </span>
              <p className="text-slate-400 leading-normal">
                The engine evaluates operating load against baseline thermal limits ({selectedComponent.baselineTempC}°C) and calculates instantaneous rate of temperature rise (+{selectedComponent.heatingRateCMin}°C/min). Severe thermal divergence triggers automated hardware isolation protocols.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
