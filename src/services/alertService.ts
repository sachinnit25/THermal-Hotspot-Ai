import { AlertRule, Hotspot, IncidentAlert } from '../types/hotspot';

export const DEFAULT_ALERT_RULES: AlertRule[] = [
  {
    id: 'rule-ind-critical',
    name: 'Critical Industrial Hazard Threshold',
    enabled: true,
    minIndustrialRisk: 0.72,
    minFrpMW: 40,
    targetClasses: ['industrial', 'gas_flare'],
    nearFacilityThresholdMeters: 1000,
    soundAlarm: true,
    notificationChannels: ['in_app', 'webhook'],
  },
  {
    id: 'rule-wildfire-urgent',
    name: 'High Radiative Wildfire Alert',
    enabled: true,
    minIndustrialRisk: 0.0,
    minFrpMW: 120,
    targetClasses: ['wildfire'],
    nearFacilityThresholdMeters: 5000,
    soundAlarm: true,
    notificationChannels: ['in_app'],
  },
  {
    id: 'rule-flare-emission',
    name: 'Elevated Petrochemical Gas Flaring',
    enabled: true,
    minIndustrialRisk: 0.50,
    minFrpMW: 65,
    targetClasses: ['gas_flare'],
    nearFacilityThresholdMeters: 1500,
    soundAlarm: false,
    notificationChannels: ['in_app'],
  },
];

export class AlertEngine {
  private rules: AlertRule[];
  private alerts: IncidentAlert[] = [];
  private listeners: ((alert: IncidentAlert) => void)[] = [];

  constructor(initialRules: AlertRule[] = DEFAULT_ALERT_RULES) {
    this.rules = initialRules;
  }

  public getRules(): AlertRule[] {
    return [...this.rules];
  }

  public setRules(rules: AlertRule[]) {
    this.rules = rules;
  }

  public updateRule(ruleId: string, patch: Partial<AlertRule>) {
    this.rules = this.rules.map((r) => (r.id === ruleId ? { ...r, ...patch } : r));
  }

  public addRule(rule: AlertRule) {
    this.rules.push(rule);
  }

  public removeRule(ruleId: string) {
    this.rules = this.rules.filter((r) => r.id !== ruleId);
  }

  public getAlerts(): IncidentAlert[] {
    return [...this.alerts];
  }

  public acknowledgeAlert(alertId: string) {
    this.alerts = this.alerts.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a));
  }

  public clearAlerts() {
    this.alerts = [];
  }

  public onAlertTriggered(callback: (alert: IncidentAlert) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  /**
   * Evaluate a hotspot against active rules
   */
  public evaluateHotspot(hotspot: Hotspot): IncidentAlert | null {
    if (!hotspot.assessment) return null;

    for (const rule of this.rules) {
      if (!rule.enabled) continue;

      const matchesClass = rule.targetClasses.includes(hotspot.assessment.classification);
      const matchesRisk = hotspot.assessment.industrialRisk >= rule.minIndustrialRisk;
      const matchesFrp = hotspot.frpMW >= rule.minFrpMW;
      const matchesProximity =
        rule.nearFacilityThresholdMeters == null ||
        (hotspot.evidence.nearbyIndustrialMeters != null &&
          hotspot.evidence.nearbyIndustrialMeters <= rule.nearFacilityThresholdMeters);

      if (matchesClass && matchesRisk && matchesFrp && matchesProximity) {
        // Prevent duplicate trigger for same hotspot in short window
        const alreadyTriggered = this.alerts.some(
          (a) => a.hotspotId === hotspot.id && a.ruleId === rule.id
        );
        if (alreadyTriggered) continue;

        const severity: IncidentAlert['severity'] =
          hotspot.assessment.industrialRisk >= 0.72 || hotspot.frpMW >= 150
            ? 'CRITICAL'
            : hotspot.assessment.industrialRisk >= 0.5
            ? 'HIGH'
            : 'MEDIUM';

        const alert: IncidentAlert = {
          id: `alert-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          hotspotId: hotspot.id,
          ruleId: rule.id,
          ruleName: rule.name,
          severity,
          title: `${severity} INCIDENT: ${hotspot.locationName}`,
          description: `${hotspot.assessment.classification.toUpperCase()} thermal anomaly detected with FRP of ${hotspot.frpMW.toFixed(1)} MW and risk index ${(hotspot.assessment.industrialRisk * 100).toFixed(0)}%. ${hotspot.assessment.explanation}`,
          timestamp: new Date().toISOString(),
          acknowledged: false,
          hotspotSnapshot: {
            locationName: hotspot.locationName,
            latitude: hotspot.latitude,
            longitude: hotspot.longitude,
            classification: hotspot.assessment.classification,
            industrialRisk: hotspot.assessment.industrialRisk,
            frpMW: hotspot.frpMW,
          },
        };

        this.alerts.unshift(alert);
        this.listeners.forEach((listener) => listener(alert));

        if (rule.soundAlarm) {
          this.playAlertSound();
        }

        return alert;
      }
    }
    return null;
  }

  private playAlertSound() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {
      // AudioContext might be blocked before first user gesture
    }
  }
}

export const alertEngineInstance = new AlertEngine();
