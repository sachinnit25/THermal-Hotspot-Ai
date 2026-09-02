import React, { useState } from 'react';
import { 
  Bell, 
  X, 
  ShieldAlert, 
  Volume2, 
  VolumeX, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Download,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { AlertRule, IncidentAlert } from '../types/hotspot';

interface AlertRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  rules: AlertRule[];
  onUpdateRule: (ruleId: string, patch: Partial<AlertRule>) => void;
  onToggleRule: (ruleId: string) => void;
  alerts: IncidentAlert[];
  onAcknowledgeAlert: (alertId: string) => void;
  onClearAlerts: () => void;
}

export const AlertRulesModal: React.FC<AlertRulesModalProps> = ({
  isOpen,
  onClose,
  rules,
  onUpdateRule,
  onToggleRule,
  alerts,
  onAcknowledgeAlert,
  onClearAlerts,
}) => {
  const [activeTab, setActiveTab] = useState<'alerts' | 'rules'>('alerts');

  if (!isOpen) return null;

  const handleExportAlertsCsv = () => {
    if (alerts.length === 0) return;
    const header = ['ID', 'Severity', 'Title', 'Timestamp', 'Location', 'Latitude', 'Longitude', 'Class', 'Risk', 'FRP_MW'].join(',');
    const rows = alerts.map((a) => [
      a.id,
      a.severity,
      `"${a.title.replace(/"/g, '""')}"`,
      a.timestamp,
      `"${a.hotspotSnapshot.locationName.replace(/"/g, '""')}"`,
      a.hotspotSnapshot.latitude,
      a.hotspotSnapshot.longitude,
      a.hotspotSnapshot.classification,
      a.hotspotSnapshot.industrialRisk,
      a.hotspotSnapshot.frpMW,
    ].join(','));

    const csvContent = [header, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `incident-alerts-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="glass-panel relative w-full max-w-2xl overflow-hidden rounded-2xl border border-rose-500/30 bg-[#070c20] shadow-[0_0_50px_rgba(255,75,114,0.2)]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">
                Incident Alerts & Automated Threshold Rules
              </h2>
              <p className="text-xs text-slate-400">
                Automated monitoring for high-risk industrial anomalies and wildfire escalations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-space-900/60 px-5">
          <button
            onClick={() => setActiveTab('alerts')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'alerts'
                ? 'border-rose-400 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle size={14} />
            <span>Incident Trigger Log ({alerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`border-b-2 py-3 px-4 text-xs font-semibold transition-colors flex items-center gap-2 ${
              activeTab === 'rules'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert size={14} />
            <span>Active Threshold Rules ({rules.length})</span>
          </button>
        </div>

        {/* Tab 1: Incident Trigger Log */}
        {activeTab === 'alerts' && (
          <div className="p-5 space-y-4 max-h-[480px] overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                {alerts.length} active or historical automated incident logs
              </span>
              <div className="flex items-center gap-2">
                {alerts.length > 0 && (
                  <>
                    <button
                      onClick={handleExportAlertsCsv}
                      className="flex items-center gap-1 text-xs text-cyan-300 hover:text-white transition-colors"
                    >
                      <Download size={13} /> Export CSV
                    </button>
                    <button
                      onClick={onClearAlerts}
                      className="text-xs text-rose-400 hover:text-rose-300 transition-colors ml-2"
                    >
                      Clear Log
                    </button>
                  </>
                )}
              </div>
            </div>

            {alerts.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-400/60" />
                <p className="text-sm font-medium text-slate-300">No active hazard alerts</p>
                <p className="text-xs text-slate-500 mt-1">
                  All current satellite detections are operating within baseline threshold limits.
                </p>
              </div>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`rounded-xl border p-3.5 transition-all ${
                    alert.acknowledged
                      ? 'border-white/5 bg-space-850/40 opacity-70'
                      : alert.severity === 'CRITICAL'
                      ? 'border-rose-500/40 bg-rose-950/30'
                      : 'border-amber-500/30 bg-amber-950/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase font-mono ${
                            alert.severity === 'CRITICAL'
                              ? 'bg-rose-500 text-white'
                              : 'bg-amber-500 text-black'
                          }`}
                        >
                          {alert.severity}
                        </span>
                        <h4 className="font-semibold text-xs text-white">{alert.title}</h4>
                      </div>
                      <p className="text-xs text-slate-300">{alert.description}</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-2 pt-1">
                        <Clock size={11} />
                        <span>{new Date(alert.timestamp).toLocaleTimeString()} · Rule: {alert.ruleName}</span>
                      </p>
                    </div>

                    {!alert.acknowledged && (
                      <button
                        onClick={() => onAcknowledgeAlert(alert.id)}
                        className="rounded-lg bg-white/10 hover:bg-white/20 px-2.5 py-1 text-xs font-medium text-white transition-colors shrink-0"
                      >
                        Acknowledge
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Threshold Rules Configuration */}
        {activeTab === 'rules' && (
          <div className="p-5 space-y-4 max-h-[480px] overflow-y-auto">
            <p className="text-xs text-slate-400">
              Configure parameters that trigger automatic incident creation, acoustic alarms, and notification dispatches.
            </p>

            <div className="space-y-3">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className="rounded-xl border border-white/10 bg-space-850/60 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={() => onToggleRule(rule.id)}
                        className="h-4 w-4 rounded border-slate-700 bg-space-900 text-cyan-500 focus:ring-cyan-400"
                      />
                      <span className="font-semibold text-xs text-white">{rule.name}</span>
                    </div>

                    <button
                      onClick={() => onUpdateRule(rule.id, { soundAlarm: !rule.soundAlarm })}
                      className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded ${
                        rule.soundAlarm
                          ? 'text-cyan-300 bg-cyan-950/60 border border-cyan-500/30'
                          : 'text-slate-500 bg-white/5'
                      }`}
                    >
                      {rule.soundAlarm ? <Volume2 size={13} /> : <VolumeX size={13} />}
                      <span className="text-[10px]">{rule.soundAlarm ? 'Siren On' : 'Muted'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Min Industrial Risk</span>
                      <input
                        type="number"
                        step="0.05"
                        min="0"
                        max="1"
                        value={rule.minIndustrialRisk}
                        onChange={(e) => onUpdateRule(rule.id, { minIndustrialRisk: parseFloat(e.target.value) || 0 })}
                        className="w-full mt-1 rounded-lg border border-slate-700 bg-space-900 px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Min Radiative Power (MW)</span>
                      <input
                        type="number"
                        step="5"
                        min="0"
                        value={rule.minFrpMW}
                        onChange={(e) => onUpdateRule(rule.id, { minFrpMW: parseFloat(e.target.value) || 0 })}
                        className="w-full mt-1 rounded-lg border border-slate-700 bg-space-900 px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">Facility Buffer (Meters)</span>
                      <input
                        type="number"
                        step="100"
                        min="0"
                        value={rule.nearFacilityThresholdMeters}
                        onChange={(e) => onUpdateRule(rule.id, { nearFacilityThresholdMeters: parseInt(e.target.value, 10) || 0 })}
                        className="w-full mt-1 rounded-lg border border-slate-700 bg-space-900 px-2 py-1 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="border-t border-white/10 bg-space-900 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/30 px-5 py-2 text-xs font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
