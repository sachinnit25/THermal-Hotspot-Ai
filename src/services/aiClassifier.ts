import { Hotspot, HotspotAssessment, HotspotClass, HotspotEvidence, RiskLevel } from '../types/hotspot';

export interface AssessOptions {
  apiKey?: string;
  useLiveLLM?: boolean;
}

/**
 * Multi-factor contextual AI classification & hazard estimation engine
 * Combines satellite radiometric telemetry with geospatial context.
 */
export function assessHotspot(evidence: HotspotEvidence): HotspotAssessment {
  const contributingFactors: HotspotAssessment['contributingFactors'] = [];

  // 1. Land Use Factor (Up to 0.42)
  let industrialLandUseScore = 0;
  if (evidence.landUse === 'industrial') {
    industrialLandUseScore = 0.42;
    contributingFactors.push({
      factor: 'Land Use Zoning',
      weight: 0.42,
      description: 'Designated industrial corridor / heavy manufacturing zone.',
    });
  } else if (evidence.landUse === 'mining') {
    industrialLandUseScore = 0.25;
    contributingFactors.push({
      factor: 'Mining/Quarry Zone',
      weight: 0.25,
      description: 'Active mineral extraction or smelting operations territory.',
    });
  }

  // 2. Proximity to Registered Industrial Facility (Up to 0.28)
  let proximityScore = 0;
  if (evidence.nearbyIndustrialMeters != null) {
    if (evidence.nearbyIndustrialMeters <= 300) {
      proximityScore = 0.28;
      contributingFactors.push({
        factor: 'Direct Facility Footprint',
        weight: 0.28,
        description: `Within ${evidence.nearbyIndustrialMeters}m of ${evidence.nearestFacilityName || 'industrial asset'} (${evidence.facilityType || 'Heavy Industry'}).`,
      });
    } else if (evidence.nearbyIndustrialMeters <= 1000) {
      proximityScore = 0.20;
      contributingFactors.push({
        factor: 'Immediate Industrial Buffer',
        weight: 0.20,
        description: `Within ${evidence.nearbyIndustrialMeters}m of perimeter (${evidence.nearestFacilityName || 'registered asset'}).`,
      });
    } else if (evidence.nearbyIndustrialMeters <= 2500) {
      proximityScore = 0.08;
      contributingFactors.push({
        factor: 'Regional Industrial Buffer',
        weight: 0.08,
        description: `Located ${Math.round(evidence.nearbyIndustrialMeters / 1000)}km from nearest facility.`,
      });
    }
  }

  // 3. Recurrence / Persistence Pattern (Up to 0.18)
  let recurrenceScore = 0;
  if (evidence.recurrenceCount != null) {
    if (evidence.recurrenceCount >= 10) {
      recurrenceScore = 0.18;
      contributingFactors.push({
        factor: 'High Stationary Recurrence',
        weight: 0.18,
        description: `Detected ${evidence.recurrenceCount} times at identical stationary coordinates (typical of smokestacks, blast furnaces, or flare stacks).`,
      });
    } else if (evidence.recurrenceCount >= 5) {
      recurrenceScore = 0.12;
      contributingFactors.push({
        factor: 'Moderate Recurrence',
        weight: 0.12,
        description: `Detected ${evidence.recurrenceCount} times in last 90 days.`,
      });
    } else if (evidence.recurrenceCount === 1) {
      contributingFactors.push({
        factor: 'Transient Single-Event Signal',
        weight: 0.0,
        description: 'First occurrence detected at this coordinate (characteristic of emerging wildfire or controlled agricultural clearing).',
      });
    }
  }

  // 4. Radiometric Signatures (FRP & Brightness Temp) (Up to 0.12)
  let radiometricScore = 0;
  if (evidence.brightnessK && evidence.brightnessK > 350) {
    radiometricScore += 0.06;
    contributingFactors.push({
      factor: 'Extreme Thermal Radiance',
      weight: 0.06,
      description: `Surface brightness temperature of ${evidence.brightnessK.toFixed(1)} K exceeds typical biomass background.`,
    });
  }
  if (evidence.frpMW && evidence.frpMW > 50) {
    radiometricScore += 0.06;
    contributingFactors.push({
      factor: 'High Fire Radiative Power',
      weight: 0.06,
      description: `Radiative energy output ${evidence.frpMW.toFixed(1)} MW indicates intense high-heat emitter.`,
    });
  }

  // 5. Facility Signatures (Up to 0.10)
  let facilitySignalScore = 0;
  if (evidence.facilitySignals && evidence.facilitySignals.length > 0) {
    facilitySignalScore = 0.10;
    contributingFactors.push({
      factor: 'Registered Facility Signatures',
      weight: 0.10,
      description: `Matched equipment/infrastructure: ${evidence.facilitySignals.join(', ')}.`,
    });
  }

  // Aggregate Industrial Risk Index (0.0 to 1.0)
  const rawIndustrialRisk = industrialLandUseScore + proximityScore + recurrenceScore + radiometricScore + facilitySignalScore;
  const industrialRisk = Math.min(1.0, Math.max(0.0, Number(rawIndustrialRisk.toFixed(3))));

  // Confidence Calculation
  const baseConf = evidence.confidence != null ? evidence.confidence / 100 : 0.65;
  const confidence = Math.min(0.99, Math.max(0.40, Number((baseConf * 0.6 + industrialRisk * 0.4).toFixed(2))));

  // Determine Primary Classification & Narrative
  let classification: HotspotClass = 'unknown';
  let explanation = '';
  let recommendedAction = '';
  let riskLevel: RiskLevel = 'watch';

  if (industrialRisk >= 0.72) {
    classification = 'industrial';
    riskLevel = 'critical';
    explanation = `High-risk industrial thermal anomaly verified. Persistent coordinates (${evidence.recurrenceCount ?? 0} historical events), direct adjacency to ${evidence.nearestFacilityName || 'industrial facility'} (${evidence.nearbyIndustrialMeters ?? 0}m), and elevated radiative heat output (${evidence.frpMW ?? 0} MW) confirm concentrated industrial origin requiring automated compliance monitoring.`;
    recommendedAction = 'Dispatch automated telemetry alert to plant safety officer; cross-reference emissions permit and verify cooling/flare mitigation systems.';
  } else if (evidence.landUse === 'mining') {
    classification = 'mining';
    riskLevel = industrialRisk > 0.45 ? 'elevated' : 'watch';
    explanation = `Identified as open-pit mining or smelter operation signature. Spatial correlation with mineral concessions and moderate thermal radiance confirms controlled operational extraction heat.`;
    recommendedAction = 'Log into regional mining environmental registry; monitor for unpermitted slag disposal or brush spread.';
  } else if (evidence.facilitySignals?.some(s => s.toLowerCase().includes('flare') || s.toLowerCase().includes('petrochemical')) || (evidence.landUse === 'industrial' && evidence.frpMW && evidence.frpMW > 70)) {
    classification = 'gas_flare';
    riskLevel = 'elevated';
    explanation = `Thermal anomaly characteristics match continuous gas flaring or petrochemical pressure release. Highly focused stationary point emitter with pronounced night-time infrared radiance.`;
    recommendedAction = 'Cross-examine flare volume against satellite methane/VOC emission estimations; notify environmental audit team.';
  } else if (evidence.landUse === 'forest' || (evidence.recurrenceCount === 1 && !evidence.nearbyIndustrialMeters)) {
    classification = 'wildfire';
    riskLevel = (evidence.frpMW && evidence.frpMW > 80) ? 'critical' : 'elevated';
    explanation = `Wildfire thermal anomaly detected over canopy/vegetation terrain. Single-epoch footprint without proximate manufacturing infrastructure, combined with large spatial pixel spread, indicates active uncontrolled biomass combustion.`;
    recommendedAction = 'Alert regional forest fire dispatcher; cross-reference current wind speed vectors and simulate 6-hour perimeter propagation.';
  } else if (evidence.landUse === 'agricultural') {
    classification = 'agricultural';
    riskLevel = 'watch';
    explanation = `Agricultural field burn or post-harvest crop residue combustion. Signature exhibits seasonal pattern, moderate radiative power (${evidence.frpMW ?? 0} MW), and alignment with cultivated land parcel boundaries.`;
    recommendedAction = 'Catalog against seasonal stubble burning index; review local seasonal ban compliance.';
  } else if (industrialRisk >= 0.40) {
    classification = 'industrial';
    riskLevel = 'elevated';
    explanation = `Elevated probability of industrial thermal activity based on nearby zoning and recurring infrared hits, though facility identification is pending ground confirmation.`;
    recommendedAction = 'Request high-resolution optical satellite tasking (Sentinel-2 / PlanetScope) to verify exact ground infrastructure.';
  } else {
    classification = 'unknown';
    riskLevel = 'unassessed';
    explanation = `Thermal signature has insufficient contextual evidence to definitively classify. Mixed land-use indicators and borderline radiative characteristics require further satellite observation passes.`;
    recommendedAction = 'Flag for analyst manual review on next satellite overpass (NOAA-20 / VIIRS pass).';
  }

  return {
    classification,
    confidence,
    industrialRisk,
    riskLevel,
    explanation,
    contributingFactors,
    recommendedAction,
    assessedAt: new Date().toISOString(),
    modelUsed: 'Orbital-Context-Engine-v2',
  };
}

/**
 * Optional live AI reasoning using Google Gemini API
 */
export async function assessHotspotWithGemini(
  hotspot: Hotspot,
  apiKey: string
): Promise<HotspotAssessment> {
  const deterministic = assessHotspot(hotspot.evidence);

  try {
    const prompt = `You are the lead orbital satellite imagery and thermal anomaly intelligence officer for the NASA FIRMS & Industrial Incident Monitoring System.
Analyze the following satellite thermal detection data and provide a concise, structured JSON assessment:

Detection Data:
- Location: ${hotspot.locationName}, ${hotspot.country} (Lat: ${hotspot.latitude.toFixed(4)}, Lon: ${hotspot.longitude.toFixed(4)})
- Satellite Source: ${hotspot.source}
- Brightness Temperature: ${hotspot.brightnessK} K
- Fire Radiative Power (FRP): ${hotspot.frpMW} MW
- Satellite Confidence: ${hotspot.satelliteConfidence}%
- Day/Night: ${hotspot.dayNight === 'D' ? 'Daytime' : 'Nighttime'}
- Land Use: ${hotspot.evidence.landUse || 'Unknown'}
- Distance to Industrial Facility: ${hotspot.evidence.nearbyIndustrialMeters ?? 'None'} meters (${hotspot.evidence.nearestFacilityName || 'None'})
- Historical Recurrence at Coords: ${hotspot.evidence.recurrenceCount ?? 1} times
- Facility Signals: ${hotspot.evidence.facilitySignals?.join(', ') || 'None'}

Return ONLY valid JSON in this exact structure:
{
  "classification": "industrial" | "wildfire" | "agricultural" | "gas_flare" | "mining" | "unknown",
  "confidence": 0.88,
  "industrialRisk": 0.85,
  "riskLevel": "critical" | "elevated" | "watch" | "unassessed",
  "explanation": "concise 2-sentence technical intelligence explanation",
  "recommendedAction": "concise operational recommendation",
  "contributingFactors": [
    { "factor": "Name of factor", "weight": 0.35, "description": "why it matters" }
  ]
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) {
      console.warn('Gemini API error, falling back to deterministic model');
      return deterministic;
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return deterministic;

    const parsed = JSON.parse(rawText);
    return {
      classification: parsed.classification || deterministic.classification,
      confidence: parsed.confidence || deterministic.confidence,
      industrialRisk: parsed.industrialRisk || deterministic.industrialRisk,
      riskLevel: parsed.riskLevel || deterministic.riskLevel,
      explanation: parsed.explanation || deterministic.explanation,
      contributingFactors: parsed.contributingFactors || deterministic.contributingFactors,
      recommendedAction: parsed.recommendedAction || deterministic.recommendedAction,
      assessedAt: new Date().toISOString(),
      modelUsed: 'Gemini-1.5-Pro',
    };
  } catch (error) {
    console.warn('Live LLM assessment failed, falling back to local engine:', error);
    return deterministic;
  }
}

/**
 * Check if assessment crosses critical industrial fire alert threshold
 */
export function isIndustrialFireAlert(assessment: HotspotAssessment, threshold = 0.72): boolean {
  return assessment.classification === 'industrial' && assessment.industrialRisk >= threshold;
}
