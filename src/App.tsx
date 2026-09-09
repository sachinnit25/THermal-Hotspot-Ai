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
import { ComponentHotspotInspector } from './components/ComponentHotspotInspector';
import { Interactive3DSatelliteMap } from './components/Interactive3DSatelliteMap';
import { MainScreenEmergencyBanner } from './components/MainScreenEmergencyBanner';
import { IntroAnimation } from './components/IntroAnimation';
import {
  getInitialHotspotsWithAssessments,
  generateRealtimeHotspot,
  fetchLiveFirmsHotspots,
  DEFAULT_NASA_MAP_KEY,
  DEFAULT_GEMINI_API_KEY
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
  const [emergencyBannerHotspot, setEmergencyBannerHotspot] = useState<Hotspot | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isAssessing, setIsAssessing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; desc: string; tone: string } | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Active Nav Pill - Focused purely on NASA FIRMS AI Detective
  const [activePill, setActivePill] = useState<'area' | 'map' | 'analytics' | 'firms'>('area');

  // Modals & Workbench Drawer
  const [isWorkbenchOpen, setIsWorkbenchOpen] = useState<boolean>(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState<boolean>(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isCsvImportModalOpen, setIsCsvImportModalOpen] = useState<boolean>(false);

  // API Keys & Rules
  const [firmsMapKey, setFirmsMapKey] = useState<string>(
    () => localStorage.getItem('firms_map_key') || DEFAULT_NASA_MAP_KEY
  );
  const [geminiApiKey, setGeminiApiKey] = useState<string>(
    () => localStorage.getItem('gemini_api_key') || DEFAULT_GEMINI_API_KEY
  );
  const [rules, setRules] = useState<AlertRule[]>(() => alertEngineInstance.getRules());
  const [alerts, setAlerts] = useState<IncidentAlert[]>(() => alertEngineInstance.getAlerts());

  const [showIntro, setShowIntro] = useState<boolean>(() => {
    return sessionStorage.getItem('thermalguard_intro_seen') !== 'true';
  });

  // Auto-fetch live NASA FIRMS data on mount
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

          showToast(
            'NASA FIRMS Stream Online',
            `Fetched ${liveRows.length} live satellite detections via NASA MAP_KEY.`,
            'cyan'
          );
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

      showToast(
        newAlert.title,
        newAlert.description,
        'red'
      );
    });

    return () => unsubscribe();
  }, []);

  const showToast = (
    title: string,
    desc: string,
    tone = 'cyan'
  ) => {
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

      if (hs.frpMW > maxFrp) {
        maxFrp = hs.frpMW;
      }

      const dt = new Date(hs.detectedAt).getTime();

      if (now - dt <= oneDay) {
        recent24h++;
      }
    });

    const total = hotspots.length || 1;

    return {
      totalDetections: hotspots.length,
      highRiskIndustrialCandidates: hotspots.filter(
        (h) => (h.assessment?.industrialRisk ?? 0) >= 0.72
      ).length,
      totalAssessed: hotspots.filter(
        (h) => h.assessment != null
      ).length,
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

          showToast(
            'NASA FIRMS Stream Updated',
            `Received ${liveRows.length} satellite detections.`,
            'cyan'
          );
        } else {
          showToast(
            'FIRMS Synchronized',
            'No new active anomalies in current pass.',
            'cyan'
          );
        }
      } catch (err) {
        showToast(
          'FIRMS Live Notice',
          'Operating with cached high-fidelity global telemetry.',
          'orange'
        );
      }
    } else {
      setTimeout(() => {
        showToast(
          'Telemetry Synchronized',
          'Drone & Satellite telemetry synchronized across surveillance sectors.',
          'cyan'
        );

        setIsRefreshing(false);
      }, 700);

      return;
    }

    setIsRefreshing(false);
  };

  const handleNormalizeHotspot = (hotspotId: string) => {
    setHotspots((prev) =>
      prev.map((h) => {
        if (h.id === hotspotId) {
          const normalizedEvidence = {
            ...h.evidence,
            brightnessK: 300.0,
            frpMW: 10.0,
            confidence: 95,
          };
          const assessment = assessHotspot(normalizedEvidence);
          assessment.explanation = `✅ Thermal anomaly successfully normalized by emergency safety response team. Baseline temperatures restored (300.0 K / 26.8°C).`;
          assessment.riskLevel = 'watch';
          assessment.industrialRisk = 0.15;
          return {
            ...h,
            brightnessK: 300.0,
            frpMW: 10.0,
            satelliteConfidence: 95,
            evidence: normalizedEvidence,
            assessment,
            risk_score: 15,
            risk_level: 'LOW',
          };
        }
        return h;
      })
    );

    showToast('Thermal Anomaly Normalized', 'Component / sector temperature successfully normalized by safety response team.', 'cyan');
  };

  const handleSimulatePass = () => {
    const newHotspot = generateRealtimeHotspot();

    setHotspots((prev) => [
      newHotspot,
      ...prev
    ]);

    setSelectedHotspot(newHotspot);
    setEmergencyBannerHotspot(newHotspot);

    alertEngineInstance.evaluateHotspot(newHotspot);

    showToast(
      '🚨 EMERGENCY MAP ANOMALY DETECTED',
      `${newHotspot.locationName} (${newHotspot.frpMW.toFixed(1)} MW FRP). Worker notification dispatched.`,
      'red'
    );
  };

  const handleAssessWithAI = async (hotspot: Hotspot) => {
    setIsAssessing(true);

    let updatedAssessment;

    if (geminiApiKey.trim()) {
      updatedAssessment = await assessHotspotWithGemini(
        hotspot,
        geminiApiKey
      );
    } else {
      updatedAssessment = assessHotspot(
        hotspot.evidence
      );
    }

    const updatedHotspot = {
      ...hotspot,
      assessment: updatedAssessment,
    };

    setHotspots((prev) =>
      prev.map((h) =>
        h.id === hotspot.id
          ? updatedHotspot
          : h
      )
    );

    setSelectedHotspot(updatedHotspot);

    alertEngineInstance.evaluateHotspot(
      updatedHotspot
    );

    setIsAssessing(false);

    showToast(
      'AI Classification Complete',
      `${updatedAssessment.classification.toUpperCase()} verified with ${(updatedAssessment.confidence * 100).toFixed(0)}% confidence.`,
      'cyan'
    );
  };

  const handleTriggerAlert = (hotspot: Hotspot) => {
    alertEngineInstance.evaluateHotspot(hotspot);

    showToast(
      'Incident Alert Broadcast',
      `Tactical response alert dispatched for ${hotspot.locationName}.`,
      'red'
    );
  };

  const handleToggleReviewed = (hotspotId: string) => {
    setHotspots((prev) =>
      prev.map((h) =>
        h.id === hotspotId
          ? {
              ...h,
              reviewedByAnalyst: !h.reviewedByAnalyst
            }
          : h
      )
    );

    if (selectedHotspot?.id === hotspotId) {
      setSelectedHotspot((prev) =>
        prev
          ? {
              ...prev,
              reviewedByAnalyst: !prev.reviewedByAnalyst
            }
          : null
      );
    }
  };

  const handleSaveNotes = (
    hotspotId: string,
    notes: string
  ) => {
    setHotspots((prev) =>
      prev.map((h) =>
        h.id === hotspotId
          ? {
              ...h,
              notes
            }
          : h
      )
    );

    if (selectedHotspot?.id === hotspotId) {
      setSelectedHotspot((prev) =>
        prev
          ? {
              ...prev,
              notes
            }
          : null
      );
    }
  };

  const handleSaveFirmsKey = (key: string) => {
    setFirmsMapKey(key);
    localStorage.setItem(
      'firms_map_key',
      key
    );
  };

  const handleSaveGeminiKey = (key: string) => {
    setGeminiApiKey(key);
    localStorage.setItem(
      'gemini_api_key',
      key
    );
  };

  const activeAlertCount = alerts.filter(
    (a) => !a.acknowledged
  ).length;

  const handleIntroComplete = () => {
    sessionStorage.setItem(
      'thermalguard_intro_seen',
      'true'
    );

    setShowIntro(false);
  };

  return (
    <>
      {showIntro && (
        <IntroAnimation
          onComplete={handleIntroComplete}
        />
      )}

      {/* Main Screen Emergency Anomaly Detection Banner */}
      <MainScreenEmergencyBanner
        hotspot={emergencyBannerHotspot}
        onNormalize={(id) => handleNormalizeHotspot(id)}
        onDismiss={() => setEmergencyBannerHotspot(null)}
      />

      {/* Main Tactical Application Layer */}
      <div className="relative min-h-screen bg-[#05080D] text-slate-100 font-sans">
        <div className="relative z-10 flex flex-col min-h-screen">
          {/* Tactical Top Navigation Bar */}
          <TacticalTopNav
            activePill={activePill}
            onSelectPill={(pill) =>
              setActivePill(pill)
            }
            activeAlertCount={activeAlertCount}
            onOpenAlerts={() =>
              setIsAlertModalOpen(true)
            }
            onOpenApiKeys={() =>
              setIsApiKeyModalOpen(true)
            }
            onOpenCsvImport={() =>
              setIsCsvImportModalOpen(true)
            }
            onSimulatePass={
              handleSimulatePass
            }
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing}
            soundEnabled={soundEnabled}
            onToggleSound={() =>
              setSoundEnabled(!soundEnabled)
            }
          />

          {/* Main Dashboard Body */}
          <main className="p-4 sm:p-6 lg:p-8 space-y-6">

            {/* VIEW 1: Primary Tactical Mission Command */}
            {(activePill === 'area' ||
              activePill === 'map') && (
              <div className="space-y-6">

                <div className="grid gap-6 lg:grid-cols-12 items-start">

                  {/* Left Column */}
                  <div className="lg:col-span-3 xl:col-span-3">
                    <WeatherAndScanPanel
                      metrics={metrics}
                      selectedHotspot={
                        selectedHotspot
                      }
                    />
                  </div>

                  {/* Center Stage */}
                  <div className="lg:col-span-6 xl:col-span-6 space-y-6">

                    <TacticalCenterView
                      hotspots={hotspots}
                      selectedHotspot={
                        selectedHotspot
                      }
                      onSelectHotspot={(hs) =>
                        setSelectedHotspot(hs)
                      }
                      onQuickAssess={
                        handleAssessWithAI
                      }
                    />

                    {/* Bottom Fleet Row */}
                    <CommandAndFleetRow
                      selectedHotspot={
                        selectedHotspot
                      }
                      onDispatchTeam={(loc) =>
                        showToast(
                          'Rescue Team Dispatched',
                          `Ground unit routed to ${loc}.`,
                          'cyan'
                        )
                      }
                    />

                  </div>

                  {/* Right Column */}
                  <div className="lg:col-span-3 xl:col-span-3">
                    <AutopilotControlPanel
                      hotspots={hotspots}
                      selectedHotspot={
                        selectedHotspot
                      }
                      onSelectHotspot={(hs) =>
                        setSelectedHotspot(hs)
                      }
                      onOpenWorkbench={(hs) => {
                        setSelectedHotspot(hs);
                        setIsWorkbenchOpen(true);
                      }}
                    />
                  </div>

                </div>
              </div>
            )}

            {/* VIEW 2: Telemetry Analytics */}
            {activePill === 'analytics' && (
              <TelemetryAnalytics
                hotspots={hotspots}
                metrics={metrics}
              />
            )}

            {/* VIEW 5: NASA FIRMS Full Explorer */}
            {activePill === 'firms' && (
              <div className="grid gap-6 lg:grid-cols-12 items-start">

                <div className="lg:col-span-5">
                  <HotspotList
                    hotspots={hotspots}
                    selectedHotspot={
                      selectedHotspot
                    }
                    onSelectHotspot={(hs) =>
                      setSelectedHotspot(hs)
                    }
                    onBatchAssess={() => {
                      setHotspots((prev) =>
                        prev.map((h) => ({
                          ...h,
                          assessment:
                            assessHotspot(
                              h.evidence
                            )
                        }))
                      );

                      showToast(
                        'Batch Assessment Complete',
                        'Re-assessed all satellite telemetry signatures.',
                        'cyan'
                      );
                    }}
                  />
                </div>

                <div className="lg:col-span-7">
                  <HotspotDetailWorkbench
                    hotspot={selectedHotspot}
                    onAssessWithAI={
                      handleAssessWithAI
                    }
                    onTriggerAlert={
                      handleTriggerAlert
                    }
                    onToggleReviewed={
                      handleToggleReviewed
                    }
                    onSaveNotes={
                      handleSaveNotes
                    }
                    isAssessing={
                      isAssessing
                    }
                  />
                </div>

              </div>
            )}

          </main>

          {/* Footer */}
          <footer className="border-t border-[#1B2935] bg-[#05080D]/90 py-5 text-center text-xs text-slate-500 font-mono">

            <div className="mx-auto max-w-[1800px] px-6 flex flex-col sm:flex-row items-center justify-between gap-2">

              <span>
                THERMALGUARD AI · NASA FIRMS ORBITAL & TACTICAL DRONE RECONNAISSANCE
              </span>

              <span>
                AUTONOMOUS THERMAL HOTSPOT ENGINE · v2.6 PRO
              </span>

            </div>

          </footer>

        </div>

        {/* Floating Modal: AI Evidence Dossier */}
        {isWorkbenchOpen &&
          selectedHotspot && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4">

              <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-[#1B2935] bg-[#0A0D16] shadow-[0_0_60px_rgba(56,189,248,0.18)]">

                <div className="absolute top-4 right-4 z-20">

                  <button
                    onClick={() =>
                      setIsWorkbenchOpen(false)
                    }
                    className="rounded-full border border-[#1B2935] bg-obsidian-850 p-2 text-slate-300 hover:border-[#38BDF8]/40 hover:text-[#38BDF8] transition-colors"
                  >
                    <X size={18} />
                  </button>

                </div>

                <HotspotDetailWorkbench
                  hotspot={selectedHotspot}
                  onAssessWithAI={
                    handleAssessWithAI
                  }
                  onTriggerAlert={
                    handleTriggerAlert
                  }
                  onToggleReviewed={
                    handleToggleReviewed
                  }
                  onSaveNotes={
                    handleSaveNotes
                  }
                  isAssessing={
                    isAssessing
                  }
                />

              </div>
            </div>
          )}

        {/* Alert Rules Modal */}
        <AlertRulesModal
          isOpen={isAlertModalOpen}
          onClose={() =>
            setIsAlertModalOpen(false)
          }
          rules={rules}
          onUpdateRule={(id, patch) => {
            alertEngineInstance.updateRule(
              id,
              patch
            );

            setRules(
              alertEngineInstance.getRules()
            );
          }}
          onToggleRule={(id) => {
            const rule = rules.find(
              (r) => r.id === id
            );

            if (rule) {
              alertEngineInstance.updateRule(
                id,
                {
                  enabled: !rule.enabled
                }
              );

              setRules(
                alertEngineInstance.getRules()
              );
            }
          }}
          alerts={alerts}
          onAcknowledgeAlert={(id) => {
            alertEngineInstance.acknowledgeAlert(
              id
            );

            setAlerts(
              alertEngineInstance.getAlerts()
            );
          }}
          onClearAlerts={() => {
            alertEngineInstance.clearAlerts();
            setAlerts([]);
          }}
        />

        {/* API Key Modal */}
        <ApiKeyModal
          isOpen={isApiKeyModalOpen}
          onClose={() =>
            setIsApiKeyModalOpen(false)
          }
          firmsMapKey={firmsMapKey}
          onSaveFirmsMapKey={
            handleSaveFirmsKey
          }
          geminiApiKey={geminiApiKey}
          onSaveGeminiApiKey={
            handleSaveGeminiKey
          }
        />

        {/* CSV Import Modal */}
        <CsvImportModal
          isOpen={isCsvImportModalOpen}
          onClose={() =>
            setIsCsvImportModalOpen(false)
          }
          onImportHotspots={(newHotspots) => {
            setHotspots((prev) => [
              ...newHotspots,
              ...prev
            ]);

            setSelectedHotspot(
              newHotspots[0]
            );

            showToast(
              'CSV Ingestion Complete',
              `Ingested ${newHotspots.length} new thermal detections.`,
              'cyan'
            );
          }}
        />

        {/* Floating Alert Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 rounded-2xl border border-[#1B2935] bg-[#05080D]/95 p-4 shadow-[0_0_30px_rgba(56,189,248,0.18)] backdrop-blur-2xl max-w-md animate-slide-up">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#38BDF8] text-[#05080D] shadow-[0_0_14px_rgba(56,189,248,0.25)]">
              <Sparkles size={16} />
            </div>

            <div className="flex-1 min-w-0">

              <h4 className="font-bold text-xs text-white">
                {toastMessage.title}
              </h4>

              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {toastMessage.desc}
              </p>

            </div>

            <button
              onClick={() =>
                setToastMessage(null)
              }
              className="text-slate-500 hover:text-white"
            >
              ✕
            </button>

          </div>
        )}

      </div>
    </>
  );
}