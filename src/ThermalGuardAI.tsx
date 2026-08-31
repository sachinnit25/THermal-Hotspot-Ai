import React, { useState, useEffect } from 'react';

export interface HotspotRecord {
  hotspot_id: string;
  latitude: number;
  longitude: number;
  brightness_ti4: number;
  brightness_ti5: number;
  frp: number;
  predicted_category: 'Industrial Fire' | 'Gas Flare' | 'Agricultural Burning' | 'Wildfire' | 'Mining Thermal Activity' | 'Unknown / Anomalous';
  confidence_score: number;
  nearest_facility_name: string;
  nearest_facility_distance_km: number;
  refinery_dist_km: number;
  population_dist_km: number;
  highway_dist_km: number;
  risk_score: number;
  risk_level: string;
  xai_reasons: string[];
  incident_timeline: Array<{ day: string; status: string; frp: number; level: string }>;
}

export const ThermalGuardAI: React.FC = () => {
  const [records, setRecords] = useState<HotspotRecord[]>([]);

  useEffect(() => {
    fetch('/api/hotspots')
      .then(res => res.json())
      .then(data => setRecords(data.hotspots || []))
      .catch(console.error);
  }, []);

  return (
    <div className="thermalguard-container">
      <h1>ThermalGuard AI Engine</h1>
      <p>Loaded {records.length} satellite anomaly classifications.</p>
    </div>
  );
};
