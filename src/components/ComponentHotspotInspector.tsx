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
  Sparkles,
  Clock,
  LineChart,
  Layers,
  BarChart3
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

export type TimeSeriesModel = 'Linear Regression' | 'XGBoost / Random Forest' | 'LSTM Time-Series' | 'Transformer-TS';

export interface TrendPoint {
  timeLabel: string;
  minutes: number;
  tempC: number;
  isBreached: boolean;
}

export function computeThermalTrendPrediction(
  item: ComponentThermalItem,
  criticalLimitC: number = 100.0,
  model: TimeSeriesModel = 'Linear Regression'
): {
  points: TrendPoint[];
  minutesToCritical: number | null;
  predictiveNarrative: string;
} {
  const rate = item.heatingRateCMin;
  const current = item.currentTempC;

  // Time horizon steps in minutes: 0 (Now), 5, 10, 15, 20, 30
  const horizons = [0, 5, 10, 15, 20, 30];

  // Model variance coefficient
  let modelMultiplier = 1.0;
  if (model === 'XGBoost / Random Forest') modelMultiplier = 0.95;
  if (model === 'LSTM Time-Series') modelMultiplier = 1.08;
  if (model === 'Transformer-TS') modelMultiplier = 1.02;

  const points: TrendPoint[] = horizons.map((m) => {
    let projectedTemp = current + m * rate * modelMultiplier;
    projectedTemp = Math.round(projectedTemp * 10) / 10;
    return {
      timeLabel: m === 0 ? 'Now' : `+${m}m`,
      minutes: m,
      tempC: projectedTemp,
      isBreached: projectedTemp >= criticalLimitC
    };
  });

  let minutesToCritical: number | null = null;
  if (current >= criticalLimitC) {
    minutesToCritical = 0;
  } else if (rate > 0) {
    minutesToCritical = Math.max(1, Math.round(((criticalLimitC - current) / (rate * modelMultiplier))));
  }

  let predictiveNarrative = '';
  if (minutesToCritical === 0) {
    predictiveNarrative = `🔴 CRITICAL THRESHOLD BREACHED: ${item.name} is currently at ${current}°C (Exceeds ${criticalLimitC}°C limit). Immediate cooling isolation required.`;
  } else if (minutesToCritical !== null && minutesToCritical <= 30) {
    predictiveNarrative = `🔴 PREDICTED CRITICAL THRESHOLD: ${item.name} will breach ${criticalLimitC}°C threshold in ${minutesToCritical} minutes at current heating rate (+${rate.toFixed(1)}°C/min).`;
  } else {
    predictiveNarrative = `🟢 STABLE THERMAL TRAJECTORY: ${item.name} trajectory remains safely below ${criticalLimitC}°C critical limit for >30 minutes.`;
  }

  return { points, minutesToCritical, predictiveNarrative };
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
  const [selectedModel, setSelectedModel] = useState<TimeSeriesModel>('Linear Regression');
  const [criticalLimitC, setCriticalLimitC] = useState<number>(100);
  const [isSimulatingStress, setIsSimulatingStress] = useState<boolean>(false);
  const [newCompName, setNewCompName] = useState<string>('');
  const [newCompTemp, setNewCompTemp] = useState<string>('85');
  const [newCompBaseline, setNewCompBaseline] = useState<string>('70');
  const [newCompRate, setNewCompRate] = useState<string>('2.5');

  const selectedComponent = components.find((c) => c.id === selectedCompId) || components[0];
  const selectedAiAnalysis = generateComponentAINarrative(selectedComponent);

  // Time-series trend calculation
  const trendPrediction = computeThermalTrendPrediction(selectedComponent, criticalLimitC, selectedModel);

  const handleSimulateStress = () => {
    setIsSimulatingStress(true);
    setTimeout(() => {
      setComponents((prev) =>
        prev.map((item) => {
          const tempIncrease = item.status === 'Critical' ? 4 : item.status === 'Warning' ? 2.5 : 1.2;
          const newTemp = Math.min(125, Math.round((item.currentTempC + tempIncrease) * 10) / 10);
          const newRate = Math.min(9.5, Math.round((item.heatingRateCMin + 0.4) * 10) / 10);
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

  // Find maximum temperature for chart scaling
  const maxProjected = Math.max(120, ...trendPrediction.points.map((p) => p.tempC));

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-2xl backdrop-blur-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-6 h-6 text-amber-400 animate-pulse" />
            <h2 className="text-xl font-bold text-slate-100 tracking-wide">
              🔥 Predictive Thermal Trend & Anomaly AI Pipeline
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Transforms monitoring data into time-series thermal trajectory predictions and estimates time-to-critical thresholds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateStress}
            disabled={isSimulatingStress}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white rounded-lg text-xs font-semibold shadow-lg shadow-rose-950/40 transition-all disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {isSimulatingStress ? 'Simulating Thermal Surge...' : 'Simulate Thermal Surge'}
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
                Subsystem Telemetry Matrix
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {components.length} Monitored Assets
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/30">
                    <th className="py-2.5 px-4 font-medium">Component</th>
                    <th className="py-2.5 px-4 font-medium">Temperature</th>
                    <th className="py-2.5 px-4 font-medium">Operating Baseline</th>
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
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-amber-300 uppercase tracking-wider">
                AI Anomaly Intelligence Statement
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
          </div>
        </div>
      </div>

      {/* 🔮 FEATURE 5: THERMAL TREND PREDICTION & TIME-SERIES TRAJECTORY CARD */}
      <div className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <LineChart className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                📈 Thermal Trend Trajectory Prediction
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold uppercase">
                  Time-Series Anomaly ML
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Projected temperature trajectory over future time horizons (Now, +5m, +10m, +15m, +20m, +30m).
              </p>
            </div>
          </div>

          {/* Model Selector & Critical Limit Settings */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400 text-[11px]">ML Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as TimeSeriesModel)}
                className="bg-transparent text-slate-200 font-semibold focus:outline-none cursor-pointer"
              >
                <option value="Linear Regression" className="bg-slate-900">Linear Regression (Fast)</option>
                <option value="XGBoost / Random Forest" className="bg-slate-900">XGBoost / Random Forest</option>
                <option value="LSTM Time-Series" className="bg-slate-900">LSTM Time-Series</option>
                <option value="Transformer-TS" className="bg-slate-900">Transformer Time-Series</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs">
              <span className="text-slate-400 text-[11px]">Threshold Limit:</span>
              <input
                type="number"
                value={criticalLimitC}
                onChange={(e) => setCriticalLimitC(Number(e.target.value) || 100)}
                className="w-14 bg-transparent text-rose-400 font-mono font-bold focus:outline-none"
              />
              <span className="text-slate-400">°C</span>
            </div>
          </div>
        </div>

        {/* Critical Threshold Prediction Banner */}
        <div className={`p-4 rounded-xl border flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg ${
          trendPrediction.minutesToCritical === 0
            ? 'bg-rose-950/60 border-rose-500/50 text-rose-200'
            : trendPrediction.minutesToCritical !== null && trendPrediction.minutesToCritical <= 30
            ? 'bg-gradient-to-r from-rose-950/40 via-amber-950/30 to-slate-900/60 border-amber-500/40 text-amber-200'
            : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
        }`}>
          <div className="flex items-center gap-3">
            <Clock className={`w-6 h-6 ${
              trendPrediction.minutesToCritical !== null && trendPrediction.minutesToCritical <= 15
                ? 'text-rose-400 animate-bounce'
                : 'text-amber-400'
            }`} />
            <div>
              <span className="block text-[10px] uppercase tracking-wider font-semibold opacity-75">
                Time-to-Critical Threshold Estimator
              </span>
              <p className="text-sm font-bold font-mono">
                {trendPrediction.predictiveNarrative}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 px-4 py-2 rounded-lg border border-slate-800 text-center shrink-0">
            <div>
              <span className="block text-[9px] text-slate-400 uppercase font-semibold">
                Predicted Threshold Breach
              </span>
              <span className="text-base font-black font-mono text-rose-400">
                {trendPrediction.minutesToCritical !== null
                  ? `${trendPrediction.minutesToCritical} min`
                  : '> 30 min'}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Time-Series Trajectory Chart (ASCII & SVG Grid) */}
        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span>Trajectory Time-Series (Horizon: 0m to +30m)</span>
            <span className="font-mono text-rose-400">🔴 Critical Threshold Limit: {criticalLimitC}°C</span>
          </div>

          {/* SVG Line & Point Chart */}
          <div className="relative h-44 w-full bg-slate-950/90 rounded-lg border border-slate-800/80 p-3 flex flex-col justify-between overflow-hidden">
            {/* Critical Threshold Line */}
            <div
              className="absolute left-0 right-0 border-b-2 border-dashed border-rose-500/70 z-10 flex items-center justify-end px-2"
              style={{
                top: `${Math.max(5, Math.min(90, 100 - ((criticalLimitC - 50) / (maxProjected - 50)) * 100))}%`
              }}
            >
              <span className="bg-rose-950 text-rose-400 text-[10px] font-mono px-1.5 py-0.5 rounded border border-rose-500/40">
                Limit: {criticalLimitC}°C
              </span>
            </div>

            {/* Time Series Points & Connectors */}
            <div className="relative z-20 h-full flex items-end justify-between px-6 pt-4 pb-2">
              {trendPrediction.points.map((p, idx) => {
                const heightPct = Math.max(10, Math.min(90, ((p.tempC - 50) / (maxProjected - 50)) * 100));
                return (
                  <div key={idx} className="flex flex-col items-center gap-1 group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-slate-100 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap shadow-lg">
                      {p.timeLabel}: {p.tempC}°C {p.isBreached ? '(BREACH)' : ''}
                    </div>

                    {/* Temperature Dot */}
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-md ${
                        p.isBreached
                          ? 'bg-rose-500 border-rose-300 shadow-rose-500/50 scale-110 animate-pulse'
                          : p.tempC >= 85
                          ? 'bg-amber-400 border-amber-200 shadow-amber-400/50'
                          : 'bg-emerald-400 border-emerald-200'
                      }`}
                      style={{ marginBottom: `${heightPct * 0.8}px` }}
                    >
                      <span className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
                    </div>

                    {/* Temp Value Label */}
                    <span className={`text-[10px] font-mono font-bold ${p.isBreached ? 'text-rose-400' : 'text-slate-300'}`}>
                      {p.tempC}°C
                    </span>

                    {/* Time Label */}
                    <span className="text-[10px] font-mono text-slate-400 font-semibold">
                      {p.timeLabel}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
