import { describe, expect, it } from "vitest";
import { assessHotspot, deduplicateHotspots, isIndustrialFireAlert } from "@shared/hotspots";

describe("hotspot domain helpers", () => {
  it("deduplicates identical detections while preserving distinct timestamps", () => {
    const rows = [
      { latitude: 23.5, longitude: 87.2, detectedAt: 100 },
      { latitude: 23.5, longitude: 87.2, detectedAt: 100 },
      { latitude: 23.5, longitude: 87.2, detectedAt: 200 },
    ];
    expect(deduplicateHotspots(rows)).toHaveLength(2);
  });

  it("escalates a hotspot when industrial evidence crosses the threshold", () => {
    const assessment = assessHotspot({ latitude: 23.5, longitude: 87.2, confidence: 0.8, recurrenceCount: 15, nearbyIndustrialMeters: 800, landUse: "industrial", facilitySignals: ["large facility"] });
    expect(assessment.classification).toBe("industrial");
    expect(isIndustrialFireAlert(assessment)).toBe(true);
  });

  it("keeps weak contextual evidence below an industrial alert", () => {
    const assessment = assessHotspot({ latitude: 23.5, longitude: 87.2, confidence: 0.5, landUse: "forest" });
    expect(assessment.classification).toBe("wildfire");
    expect(isIndustrialFireAlert(assessment)).toBe(false);
  });
});
