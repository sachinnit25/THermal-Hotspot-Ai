export const hotspotClasses = ["industrial", "wildfire", "agricultural", "gas_flare", "mining", "unknown"] as const;
export type HotspotClass = (typeof hotspotClasses)[number];

export type HotspotEvidence = {
  latitude: number;
  longitude: number;
  confidence?: number;
  recurrenceCount?: number;
  nearbyIndustrialMeters?: number | null;
  landUse?: "industrial" | "forest" | "agricultural" | "mining" | "unknown";
  facilitySignals?: string[];
};

export type HotspotAssessment = {
  classification: HotspotClass;
  confidence: number;
  industrialRisk: number;
  explanation: string;
};

export function deduplicateHotspots<T extends { latitude: number; longitude: number; detectedAt: number }>(rows: T[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = `${row.latitude.toFixed(4)}:${row.longitude.toFixed(4)}:${row.detectedAt}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function assessHotspot(evidence: HotspotEvidence): HotspotAssessment {
  const industrial = evidence.landUse === "industrial" ? 0.42 : 0;
  const proximity = evidence.nearbyIndustrialMeters != null && evidence.nearbyIndustrialMeters <= 1000 ? 0.28 : 0;
  const recurrence = evidence.recurrenceCount != null && evidence.recurrenceCount >= 5 ? 0.18 : 0;
  const facility = evidence.facilitySignals && evidence.facilitySignals.length > 0 ? 0.1 : 0;
  const industrialRisk = Math.min(1, industrial + proximity + recurrence + facility);
  const confidence = Math.min(0.99, Math.max(0.35, (evidence.confidence ?? 0.5) + industrialRisk * 0.35));

  if (industrialRisk >= 0.72) return { classification: "industrial", confidence, industrialRisk, explanation: "Industrial land-use, proximity, recurrence, and facility evidence combine into a high-risk industrial thermal-source signal." };
  if (evidence.landUse === "forest") return { classification: "wildfire", confidence, industrialRisk, explanation: "The strongest available contextual signal is forest land use; industrial evidence is below the escalation threshold." };
  if (evidence.landUse === "agricultural") return { classification: "agricultural", confidence, industrialRisk, explanation: "The strongest available contextual signal is agricultural land use; monitor recurrence and nearby assets." };
  if (evidence.landUse === "mining") return { classification: "mining", confidence, industrialRisk, explanation: "The land-use indicator points to mining activity; additional facility evidence is required for escalation." };
  return { classification: "unknown", confidence, industrialRisk, explanation: "Available evidence is insufficient to assign a reliable source class." };
}

export function isIndustrialFireAlert(assessment: HotspotAssessment, threshold = 0.72) {
  return assessment.classification === "industrial" && assessment.industrialRisk >= threshold;
}
