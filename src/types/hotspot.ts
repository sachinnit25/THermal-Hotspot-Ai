export const HOTSPOT_CLASSES = [
  "industrial",
  "wildfire",
  "agricultural",
  "gas_flare",
  "mining",
  "unknown"
] as const;

export type HotspotClass = typeof HOTSPOT_CLASSES[number];

export type RiskLevel = "critical" | "elevated" | "watch" | "unassessed";

export type SatelliteSource = 
  | "VIIRS_NOAA20" 
  | "VIIRS_NOAA21" 
  | "VIIRS_SNPP" 
  | "MODIS_TERRA" 
  | "MODIS_AQUA" 
  | "GEO_SIMULATED";

export type LandUseType = "industrial" | "forest" | "agricultural" | "mining" | "urban" | "unknown";

export interface HotspotEvidence {
  latitude: number;
  longitude: number;
  confidence?: number;
  recurrenceCount?: number; // Count of recurring thermal signals within 2km in last 90 days
  nearbyIndustrialMeters?: number | null;
  nearestFacilityName?: string | null;
  facilityType?: string | null; // e.g. "Steel Mill", "Refinery", "Chemical Plant", "Thermal Power"
  landUse?: LandUseType;
  facilitySignals?: string[];
  brightnessK?: number; // Brightness temperature in Kelvin (e.g. 340.5 K)
  frpMW?: number; // Fire Radiative Power in MegaWatts (e.g. 24.8 MW)
  dayNight?: "D" | "N";
}

export interface HotspotAssessment {
  classification: HotspotClass;
  confidence: number; // 0.0 to 1.0
  industrialRisk: number; // 0.0 to 1.0
  riskLevel: RiskLevel;
  explanation: string;
  contributingFactors: {
    factor: string;
    weight: number;
    description: string;
  }[];
  recommendedAction: string;
  assessedAt: string;
  modelUsed: "Orbital-Context-Engine-v2" | "Gemini-1.5-Pro" | "Rule-Deterministic";
}

export interface Hotspot {
  id: string;
  externalId: string;
  latitude: number;
  longitude: number;
  locationName: string;
  country: string;
  detectedAt: string; // ISO string
  source: SatelliteSource;
  satelliteConfidence: number; // 0 - 100%
  brightnessK: number;
  frpMW: number;
  dayNight: "D" | "N";
  evidence: HotspotEvidence;
  assessment?: HotspotAssessment;
  reviewedByAnalyst?: boolean;
  notes?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  enabled: boolean;
  minIndustrialRisk: number;
  minFrpMW: number;
  targetClasses: HotspotClass[];
  nearFacilityThresholdMeters: number;
  soundAlarm: boolean;
  notificationChannels: ("in_app" | "webhook" | "email")[];
}

export interface IncidentAlert {
  id: string;
  hotspotId: string;
  ruleId: string;
  ruleName: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  hotspotSnapshot: {
    locationName: string;
    latitude: number;
    longitude: number;
    classification: HotspotClass;
    industrialRisk: number;
    frpMW: number;
  };
}

export interface DashboardMetrics {
  totalDetections: number;
  highRiskIndustrialCandidates: number;
  totalAssessed: number;
  recentActivity24h: number;
  avgConfidence: number;
  maxFrpMW: number;
  classCounts: Record<HotspotClass, number>;
  riskCounts: Record<RiskLevel, number>;
}
