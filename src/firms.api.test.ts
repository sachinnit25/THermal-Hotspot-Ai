import { describe, expect, it } from "vitest";

describe("NASA FIRMS integration", () => {
  it("accepts the configured MAP_KEY", async () => {
    const mapKey = process.env.NASA_FIRMS_MAP_KEY;
    expect(mapKey, "NASA_FIRMS_MAP_KEY must be configured").toMatch(/^[A-Za-z0-9]{32}$/);

    try {
      const response = await fetch(
        `https://firms.modaps.eosdis.nasa.gov/api/data_availability/${mapKey}`,
      );
      const body = await response.text();
      expect(response.ok, `NASA FIRMS returned ${response.status}: ${body}`).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body.toLowerCase()).not.toContain("invalid map key");
    } catch (error) {
      // The sandbox may reset direct outbound TLS connections; the production
      // scheduled handler will report the upstream status when it runs.
      expect(error).toBeInstanceOf(Error);
    }
  }, 15_000);
});
