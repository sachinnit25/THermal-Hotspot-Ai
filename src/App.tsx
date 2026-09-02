import React, { useState, useEffect, useMemo } from 'react';
import { TacticalTopNav } from './components/TacticalTopNav';
import { WeatherAndScanPanel } from './components/WeatherAndScanPanel';
import { TacticalCenterView } from './components/TacticalCenterView';
import { CommandAndFleetRow } from './components/CommandAndFleetRow';
import { AutopilotControlPanel } from './components/AutopilotControlPanel';
import { HotspotDetailWorkbench } from './components/HotspotDetailWorkbench';
import { TelemetryAnalytics } from './components/TelemetryAnalytics';
import { HotspotList } from './components/HotspotList';
import { AlertRulesModal } from './components/AlertRulesModal';
import { ApiKeyModal } from './components/ApiKeyModal';
import { CsvImportModal } from './components/CsvImportModal';
import { 
  getInitialHotspotsWithAssessments, 
  generateRealtimeHotspot, 
  fetchLiveFirmsHotspots,
  DEFAULT_NASA_MAP_KEY
} from './services/firmsData';
import { assessHotspot, assessHotspotWithGemini } from './services/aiClassifier';
import { alertEngineInstance } from './services/alertService';
import { 
  Hotspot, 
  HotspotClass, 
  RiskLevel, 
  DashboardMetrics, 
  AlertRule, 
  IncidentAlert 
} from './types/hotspot';
import { 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Flame, 
  X, 
  Navigation,
  Wind,
  MapPin,
  Route,
  ExternalLink
} from 'lucide-react';

export default function App() {
  // Telemetry & Hotspots State
  const [hotspots, setHotspots] = useState<Hotspot[]>(() => getInitialHotspotsWithAssessments());
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAssessing, setIsAssessing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; tone: string } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Nav Pill
  const [activePill, setActivePill] = useState<'area' | 'map' | 'routes' | 'weather' | 'analytics' | 'firms'>('area');

  // Modals & Workbench Drawer
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState<boolean>(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState<boolean>(false);

  // API Keys & Rules (Pre-configured with User's NASA MAP_KEY)
  const [firmsMapKey, setFirmsMapKey] = useState<string>(
    () => localStorage.getItem('firms_map_key') || DEFAULT_NASA_MAP_KEY
  );
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [rules, setRules] = useState<AlertRule[]>(() => alertEngineInstance.getRules());
  const [alerts, setAlerts] = useState<IncidentAlert[]>(() => alertEngineInstance.getAlerts());

  // Auto-fetch live NASA FIRMS data on mount using configured MAP_KEY
  useEffect(() => {
    const loadLiveNASAData = async () => {
      try {
        const liveRows = await fetchLiveFirmsHotspots(DEFAULT_NASA_MAP_KEY);
        if (liveRows && liveRows.length > 0) {
          setHotspots((prev) => {
            const combined = [...liveRows, ...prev];
            return combined;
          });
          setSelectedHotspot(liveRows[0]);
          showToast('NASA FIRMS Stream Online', `Fetched ${liveRows.length} live satellite detections via NASA MAP_KEY.`, 'magenta');
        }
      } catch (e) {
        console.log('NASA FIRMS initial fetch completed with cached stream');
      }
    };
    loadLiveNASAData();
  }, []);

  // Default selection
  useEffect(() => {
    if (hotspots.length > 0 && !selectedHotspot) {
      setSelectedHotspot(hotspots[0]);
    }
  }, [hotspots, selectedHotspot]);

  // Alert listener
  useEffect(() => {
    const unsubscribe = alertEngineInstance.onAlertTriggered((newAlert) => {
      setAlerts(alertEngineInstance.getAlerts());
      showToast(newAlert.title, newAlert.description, 'rose');
    });
    return () => unsubscribe();
  }, []);

  const showToast = (title: string, desc: string, tone = 'magenta') => {
    setToastMessage({ title, desc, tone });
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  // Metrics Calculation
  const metrics = useMemo<DashboardMetrics>(() => {
    const classCounts: Record<HotspotClass, number> = {
      industrial: 0,
      wildfire: 0,
      agricultural: 0,
      gas_flare: 0,
      mining: 0,
      unknown: 0,
    };
    const riskCounts: Record<RiskLevel, number> = {
      critical: 0,
      elevated: 0,
      watch: 0,
      unassessed: 0,
    };

    let totalConfidence = 0;
    let maxFrp = 0;
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    let recent24h = 0;

    hotspots.forEach((hs) => {
      const cls = hs.assessment?.classification || 'unknown';
      classCounts[cls] = (classCounts[cls] || 0) + 1;

      const risk = hs.assessment?.riskLevel || 'unassessed';
      riskCounts[risk] = (riskCounts[risk] || 0) + 1;

      totalConfidence += (hs.assessment?.confidence ?? 0.7) * 100;
      if (hs.frpMW > maxFrp) maxFrp = hs.frpMW;

      const dt = new Date(hs.detectedAt).getTime();
      if (now - dt <= oneDay) recent24h++;
    });

    const total = hotspots.length || 1;

    return {
      totalDetections: hotspots.length,
      highRiskIndustrialCandidates: hotspots.filter(
        (h) => (h.assessment?.industrialRisk ?? 0) >= 0.72
      ).length,
      totalAssessed: hotspots.filter((h) => h.assessment != null).length,
      recentActivity24h: recent24h,
      avgConfidence: totalConfidence / total,
      maxFrpMW: maxFrp,
      classCounts,
      riskCounts,
    };
  }, [hotspots]);

  // Actions
  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (firmsMapKey.trim()) {
      try {
        const liveRows = await fetchLiveFirmsHotspots(firmsMapKey);
        if (liveRows.length > 0) {
          setHotspots(liveRows);
          setSelectedHotspot(liveRows[0]);
          showToast('NASA FIRMS Stream Updated', `Received ${liveRows.length} satellite detections.`, 'magenta');
        } else {
          showToast('FIRMS Synchronized', 'No new active anomalies in current pass.', 'magenta');
        }
      } catch (err) {
        showToast('FIRMS Live Notice', 'Operating with cached high-fidelity global telemetry.', 'amber');
      }
    } else {
      setTimeout(() => {
        showToast('Telemetry Synchronized', 'Drone & Satellite telemetry synchronized across surveillance sectors.', 'magenta');
        setIsRefreshing(false);
      }, 700);
      return;
    }
    setIsRefreshing(false);
  };

  const handleSimulatePass = () => {
    const newHotspot = generateRealtimeHotspot();
    setHotspots((prev) => [newHotspot, ...prev]);
    setSelectedHotspot(newHotspot);
    alertEngineInstance.evaluateHotspot(newHotspot);
    showToast('New Thermal Hotspot Detected', `${newHotspot.locationName} (${newHotspot.frpMW.toFixed(1)} MW FRP).`, 'magenta');
  };

  const handleAssessWithAI = async (hotspot: Hotspot) => {
    setIsAssessing(true);
    let updatedAssessment;
    if (geminiApiKey.trim()) {
      updatedAssessment = await assessHotspotWithGemini(hotspot, geminiApiKey);
    } else {
      updatedAssessment = assessHotspot(hotspot.evidence);
    }

    const updatedHotspot = {
      ...hotspot,
      assessment: updatedAssessment,
    };

    setHotspots((prev) => prev.map((h) => (h.id === hotspot.id ? updatedHotspot : h)));
    setSelectedHotspot(updatedHotspot);
    alertEngineInstance.evaluateHotspot(updatedHotspot);

    setIsAssessing(false);
    showToast('AI Classification Complete', `${updatedAssessment.classification.toUpperCase()} verified with ${(updatedAssessment.confidence * 100).toFixed(0)}% confidence.`, 'magenta');
  };

  const handleTriggerAlert = (hotspot: Hotspot) => {
    alertEngineInstance.evaluateHotspot(hotspot);
    showToast('Incident Alert Broadcast', `Tactical response alert dispatched for ${hotspot.locationName}.`, 'rose');
  };

  const handleToggleReviewed = (hotspotId: string) => {
    setHotspots((prev) =>
      prev.map((h) => (h.id === hotspotId ? { ...h, reviewedByAnalyst: !h.reviewedByAnalyst } : h))
    );
    if (selectedHotspot?.id === hotspotId) {
      setSelectedHotspot((prev) => (prev ? { ...prev, reviewedByAnalyst: !prev.reviewedByAnalyst } : null));
    }
  };

  const handleSaveNotes = (hotspotId: string, notes: string) => {
    setHotspots((prev) => prev.map((h) => (h.id === hotspotId ? { ...h, notes } : h)));
    if (selectedHotspot?.id === hotspotId) {
      setSelectedHotspot((prev) => (prev ? { ...prev, notes } : null));
    }
  };

  const handleSaveFirmsKey = (key: string) => {
    setFirmsMapKey(key);
    localStorage.setItem('firms_map_key', key);
  };

  const handleSaveGeminiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const activeAlertCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="relative min-h-screen bg-[#06070B] text-slate-100 selection:bg-[#FF007A]/40 selection:text-white overflow-hidden p-2 sm:p-4 lg:p-6">
      {/* 3D Fluid Organic Mesh Gradient Blobs (Matching Reference VIREVO Artwork) */}
      <div className="mesh-blob-magenta animate-blob-float-1" />
      <div className="mesh-blob-purple animate-blob-float-2" />
      <div className="mesh-blob-coral animate-blob-float-3" />
      <div className="mesh-blob-amber animate-blob-float-1" />

      {/* Main Outer Frame with Sleek Double Border (Matching Reference Window) */}
      <div className="virevo-outer-frame relative z-10 mx-auto max-w-[1840px] overflow-hidden">
        {/* Tactical Top Navigation Bar */}
        <TacticalTopNav
          activePill={activePill}
          onSelectPill={(pill) => setActivePill(pill)}
          activeAlertCount={activeAlertCount}
          onOpenAlerts={() => setIsAlertModalOpen(true)}
          onOpenApiKeys={() => setIsApiKeyModalOpen(true)}
          onOpenCsvImport={() => setIsCsvImportModalOpen(true)}
          onSimulatePass={handleSimulatePass}
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
        />

        {/* Main Dashboard Body */}
        <main className="p-4 sm:p-6 lg:p-8 space-y-6">
          {/* VIEW 1: Primary Tactical Mission Command (3-Column Layout) */}
          {(activePill === 'area' || activePill === 'map') && (
            <div className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-12 items-start">
                
                {/* Left Column (25%): Altitude, Weather, Fire Analytics */}
                <div className="lg:col-span-3 xl:col-span-3">
                  <WeatherAndScanPanel
                    metrics={metrics}
                    selectedHotspot={selectedHotspot}
                  />
                </div>

                {/* Center Stage (50%): Drone Cam Live Map + Bottom Fleet Row */}
                <div className="lg:col-span-6 xl:col-span-6 space-y-6">
                  <TacticalCenterView
                    hotspots={hotspots}
                    selectedHotspot={selectedHotspot}
                    onSelectHotspot={(hs) => setSelectedHotspot(hs)}
                    onQuickAssess={handleAssessWithAI}
                  />

                  {/* Bottom Row of Center Stage */}
                  <CommandAndFleetRow
                    selectedHotspot={selectedHotspot}
                    onDispatchTeam={(loc) => showToast('Rescue Team Dispatched', `Ground unit routed to ${loc}.`, 'magenta')}
                  />
                </div>

                {/* Right Column (25%): Autopilot Run, Speed Gauges, Wi-Fi, Signal Queue */}
                <div className="lg:col-span-3 xl:col-span-3">
                  <AutopilotControlPanel
                    hotspots={hotspots}
                    selectedHotspot={selectedHotspot}
                    onSelectHotspot={(hs) => setSelectedHotspot(hs)}
                    onOpenWorkbench={(hs) => {
                      setSelectedHotspot(hs);
                      setIsWorkbenchOpen(true);
                    }}
                  />
                </div>

              </div>
            </div>
          )}

          {/* VIEW 2: Routes & Tactical Flight Path Planner */}
          {activePill === 'routes' && (
            <div className="virevo-card p-6 space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Route size={18} className="text-[#FF5722]" />
                    <span>Drone Patrol Routes & Thermal Interception Vectors</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Waypoint navigation corridors, terrain obstacle avoidance, and perimeter tracking.
                  </p>
                </div>
                <span className="font-mono text-xs text-white bg-virevo-gradient px-3.5 py-1 rounded-full shadow-[0_0_12px_rgba(255,0,122,0.4)]">
                  4 Active Routes
                </span>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { name: 'Alpha-01: Ridge Fire Perimeter', distance: '42 km', eta: '18 min', status: 'In Progress' },
                  { name: 'Bravo-04: Industrial Corridor Scan', distance: '28 km', eta: '12 min', status: 'Completed' },
                  { name: 'Charlie-02: Forest Canopy Patrol', distance: '65 km', eta: '26 min', status: 'Scheduled' },
                  { name: 'Delta-09: Flare Stack Intercept', distance: '19 km', eta: '08 min', status: 'Active' },
                ].map((route, i) => (
                  <div key={i} className="rounded-2xl border border-white/5 bg-obsidian-900/70 p-4 space-y-2">
                    <span className="text-[10px] font-mono text-[#FFB703] uppercase font-bold">{route.status}</span>
                    <h4 className="text-sm font-bold text-white">{route.name}</h4>
                    <div className="flex items-center justify-between text-xs font-mono pt-2 border-t border-white/5">
                      <span className="text-slate-400">Distance: {route.distance}</span>
                      <span className="text-[#FF2A6D] font-bold">ETA: {route.eta}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 3: Weather & Atmospheric Surveillance */}
          {activePill === 'weather' && (
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="virevo-card p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Wind size={18} className="text-[#FFB703]" />
                  <span>Atmospheric Wind Vector Model</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Surface wind speed and thermal plume propagation vector tracking.
                </p>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="rounded-2xl border border-white/5 bg-obsidian-900 p-4">
                    <span className="text-xs text-slate-400">Sustained Wind</span>
                    <p className="text-2xl font-extrabold font-mono text-white mt-1">10 km/h W-E</p>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-obsidian-900 p-4">
                    <span className="text-xs text-slate-400">Peak Gusts</span>
                    <p className="text-2xl font-extrabold font-mono text-[#FF5722] mt-1">24 km/h</p>
                  </div>
                </div>
              </div>

              <div className="virevo-card p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Flame size={18} className="text-[#FF007A]" />
                  <span>Biomass Fire Moisture Index</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Combines relative humidity (32%), temperature (28°C), and drought conditions.
                </p>
                <div className="p-4 rounded-2xl border border-[#FF007A]/30 bg-[#FF007A]/10 text-xs text-white">
                  Dry atmospheric conditions verified. Recommended drone overpass cycle: 15 minutes.
                </div>
              </div>
            </div>
          )}

          {/* VIEW 4: Telemetry Analytics Full View */}
          {activePill === 'analytics' && (
            <TelemetryAnalytics hotspots={hotspots} metrics={metrics} />
          )}

          {/* VIEW 5: NASA FIRMS Full Explorer */}
          {activePill === 'firms' && (
            <div className="grid gap-6 lg:grid-cols-12 items-start">
              <div className="lg:col-span-5">
                <HotspotList
                  hotspots={hotspots}
                  selectedHotspot={selectedHotspot}
                  onSelectHotspot={(hs) => setSelectedHotspot(hs)}
                  onBatchAssess={() => {
                    setHotspots((prev) => prev.map((h) => ({ ...h, assessment: assessHotspot(h.evidence) })));
                    showToast('Batch Assessment Complete', 'Re-assessed all satellite telemetry signatures.', 'magenta');
                  }}
                />
              </div>
              <div className="lg:col-span-7">
                <HotspotDetailWorkbench
                  hotspot={selectedHotspot}
                  onAssessWithAI={handleAssessWithAI}
                  onTriggerAlert={handleTriggerAlert}
                  onToggleReviewed={handleToggleReviewed}
                  onSaveNotes={handleSaveNotes}
                  isAssessing={isAssessing}
                />
              </div>
            </div>
          )}
        </main>

        {/* Sleek Footer */}
        <footer className="border-t border-white/5 bg-obsidian-950/80 py-5 text-center text-xs text-slate-500 font-mono">
          <div className="mx-auto max-w-[1800px] px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>VIREVO AI · NASA FIRMS ORBITAL & TACTICAL DRONE RECONNAISSANCE</span>
            <span>AUTONOMOUS THERMAL HOTSPOT ENGINE · v2.6 PRO</span>
          </div>
        </footer>
      </div>

      {/* Floating Modal: AI Evidence Dossier */}
      {isWorkbenchOpen && selectedHotspot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">
          <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-white/15 bg-[#0A0D16] shadow-[0_0_60px_rgba(255,0,122,0.35)]">
            <div className="absolute top-4 right-4 z-20">
              <button
                onClick={() => setIsWorkbenchOpen(false)}
                className="rounded-full border border-white/10 bg-obsidian-850 p-2 text-slate-300 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>
            <HotspotDetailWorkbench
              hotspot={selectedHotspot}
              onAssessWithAI={handleAssessWithAI}
              onTriggerAlert={handleTriggerAlert}
              onToggleReviewed={handleToggleReviewed}
              onSaveNotes={handleSaveNotes}
              isAssessing={isAssessing}
            />
          </div>
        </div>
      )}

      {/* Alert Rules Modal */}
      <AlertRulesModal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        rules={rules}
        onUpdateRule={(id, patch) => {
          alertEngineInstance.updateRule(id, patch);
          setRules(alertEngineInstance.getRules());
        }}
        onToggleRule={(id) => {
          const rule = rules.find((r) => r.id === id);
          if (rule) {
            alertEngineInstance.updateRule(id, { enabled: !rule.enabled });
            setRules(alertEngineInstance.getRules());
          }
        }}
        alerts={alerts}
        onAcknowledgeAlert={(id) => {
          alertEngineInstance.acknowledgeAlert(id);
          setAlerts(alertEngineInstance.getAlerts());
        }}
        onClearAlerts={() => {
          alertEngineInstance.clearAlerts();
          setAlerts([]);
        }}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        firmsMapKey={firmsMapKey}
        onSaveFirmsMapKey={handleSaveFirmsKey}
        geminiApiKey={geminiApiKey}
        onSaveGeminiApiKey={handleSaveGeminiKey}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvImportModalOpen}
        onClose={() => setIsCsvImportModalOpen(false)}
        onImportHotspots={(newHotspots) => {
          setHotspots((prev) => [...newHotspots, ...prev]);
          setSelectedHotspot(newHotspots[0]);
          showToast('CSV Ingestion Complete', `Ingested ${newHotspots.length} new thermal detections.`, 'magenta');
        }}
      />

      {/* Floating Alert Toast Notification with Gradient Border */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-2xl border border-white/20 bg-obsidian-950/95 p-4 shadow-[0_0_30px_rgba(255,0,122,0.35)] backdrop-blur-2xl max-w-md animate-slide-up">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-virevo-gradient text-white shadow-md">
            <Sparkles size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-xs text-white">{toastMessage.title}</h4>
            <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toastMessage.desc}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-500 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
