import math
from sample_data_generator import KNOWN_FACILITIES, generate_firms_hotspots

def calculate_haversine_km(lat1, lon1, lat2, lon2):
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) *
         math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

class ThermalAnomalyClassifier:
    def __init__(self, facilities=None):
        self.facilities = facilities if facilities else KNOWN_FACILITIES

    def compute_temporal_persistence(self, records, radius_km=1.5):
        n = len(records)
        for i in range(n):
            lat_i, lon_i = records[i]["latitude"], records[i]["longitude"]
            count = 0
            for j in range(n):
                dist = calculate_haversine_km(lat_i, lon_i, records[j]["latitude"], records[j]["longitude"])
                if dist <= radius_km:
                    count += 1
            records[i]["persistence_count"] = count
        return records

    def calculate_risk_score(self, frp, persistence, min_dist, is_industrial, confidence_score):
        # 0-100 Risk Engine
        frp_pts = min(25.0, (frp / 150.0) * 25.0)
        persistence_pts = min(20.0, (persistence / 8.0) * 20.0)
        
        if min_dist <= 1.0:
            proximity_pts = 20.0
        elif min_dist <= 3.0:
            proximity_pts = 14.0
        elif min_dist <= 5.0:
            proximity_pts = 8.0
        else:
            proximity_pts = 2.0

        sat_evidence_pts = min(15.0, (confidence_score / 100.0) * 15.0)
        pop_pts = 10.0 if min_dist <= 2.5 else 4.0
        historical_pts = 8.0 if persistence >= 3 else 3.0

        raw_score = int(round(frp_pts + persistence_pts + proximity_pts + sat_evidence_pts + pop_pts + historical_pts))
        final_risk = min(99, max(12, raw_score))

        if final_risk >= 81:
            risk_level = "CRITICAL"
            risk_color = "rose"
        elif final_risk >= 61:
            risk_level = "HIGH"
            risk_color = "amber"
        elif final_risk >= 31:
            risk_level = "MODERATE"
            risk_color = "violet"
        else:
            risk_level = "LOW"
            risk_color = "emerald"

        return {
            "score": final_risk,
            "level": risk_level,
            "color": risk_color,
            "breakdown": {
                "frp_intensity": round(frp_pts, 1),
                "persistence": round(persistence_pts, 1),
                "industrial_proximity": round(proximity_pts, 1),
                "satellite_evidence": round(sat_evidence_pts, 1),
                "population_proximity": round(pop_pts, 1),
                "historical_abnormality": round(historical_pts, 1)
            }
        }

    def classify_hotspot(self, row):
        lat, lon = row["latitude"], row["longitude"]
        ti4 = row.get("brightness_ti4", 320.0)
        ti5 = row.get("brightness_ti5", 300.0)
        frp = row.get("frp", 20.0)
        persistence = row.get("persistence_count", 1)
        daynight = row.get("daynight", "D")

        nearest_facility = None
        min_dist = float("inf")
        for fac in self.facilities:
            dist = calculate_haversine_km(lat, lon, fac["lat"], fac["lon"])
            if dist < min_dist:
                min_dist = dist
                nearest_facility = fac

        reasons = []
        scores = {
            "Industrial Fire": 0.0,
            "Gas Flare": 0.0,
            "Agricultural Burning": 0.0,
            "Wildfire": 0.0,
            "Mining Thermal Activity": 0.0,
            "Unknown / Anomalous": 0.0
        }

        # OSM Proximity simulation
        refinery_dist = round(min_dist, 2) if min_dist < 10.0 else round(min_dist * 0.4 + 1.2, 2)
        population_dist = round(min_dist * 0.8 + 1.5, 2)
        highway_dist = round(min_dist * 0.3 + 0.4, 2)

        fac_type = nearest_facility["type"] if nearest_facility else "Industrial Facility"

        if min_dist <= 1.5:
            if fac_type == "Gas Flare":
                scores["Gas Flare"] += 5.0
                reasons.append(f"Located within {min_dist*1000:.0f}m of active flare stack at {nearest_facility['name']}")
            elif "Mining" in fac_type:
                scores["Mining Thermal Activity"] += 5.0
                reasons.append(f"Located directly within open pit mining boundary: '{nearest_facility['name']}'")
            else:
                scores["Industrial Fire"] += 4.5
                reasons.append(f"Located {min_dist*1000:.0f}m from heavy industrial complex '{nearest_facility['name']}'")
        elif min_dist <= 5.0:
            scores["Industrial Fire"] += 2.0
            reasons.append(f"Proximity ({min_dist:.1f}km) to {nearest_facility['name']} refinery infrastructure")

        if persistence >= 5:
            scores["Gas Flare"] += 3.0
            scores["Industrial Fire"] += 2.5
            reasons.append(f"High spatial persistence ({persistence} repeated satellite passes at node)")
        elif persistence >= 2:
            scores["Industrial Fire"] += 1.5
            scores["Mining Thermal Activity"] += 1.5
            reasons.append(f"Multi-day persistent thermal recurrence ({persistence} passes)")
        else:
            scores["Wildfire"] += 2.5
            scores["Agricultural Burning"] += 2.0
            reasons.append("Single transient heat anomaly without static footprint")

        temp_diff = ti4 - ti5
        if ti4 >= 350.0 or temp_diff > 35.0:
            scores["Gas Flare"] += 3.0
            reasons.append(f"Extremely high thermal core temperature ({ti4}K, dT={temp_diff:.1f}K characteristic of gas flare stack)")
        elif ti4 >= 335.0:
            scores["Industrial Fire"] += 2.0
            reasons.append(f"Elevated brightness temperature ({ti4}K) matching combustion core")

        if frp >= 120.0:
            scores["Industrial Fire"] += 3.5
            scores["Wildfire"] += 2.5
            reasons.append(f"High Fire Radiative Power ({frp} MW) indicating intense heat release")
        elif frp <= 25.0 and daynight == "D" and persistence == 1:
            scores["Agricultural Burning"] += 3.5
            reasons.append("Low intensity daytime thermal pulse characteristic of crop residue burning")

        # Pick best category
        predicted_category = max(scores, key=scores.get)
        total_score = sum(scores.values()) + 1e-5
        confidence_pct = min(round((scores[predicted_category] / max(total_score, 5.0)) * 100, 1), 96.0)

        if scores[predicted_category] < 1.8:
            predicted_category = "Unknown / Anomalous"
            confidence_pct = 48.0
            reasons.append("Unusual thermal profile requiring analyst review")

        # Risk scoring
        is_ind = predicted_category in ["Industrial Fire", "Gas Flare"]
        risk_data = self.calculate_risk_score(frp, persistence, min_dist, is_ind, confidence_pct)

        # 5-day Incident Timeline
        timeline = [
            {"day": "Day -4", "status": "Normal", "frp": round(max(2.0, frp * 0.1), 1), "level": "LOW"},
            {"day": "Day -3", "status": "Thermal Anomaly", "frp": round(max(5.0, frp * 0.25), 1), "level": "MODERATE"},
            {"day": "Day -2", "status": "Persistent Source", "frp": round(max(10.0, frp * 0.5), 1), "level": "MODERATE"},
            {"day": "Day -1", "status": "High Intensity", "frp": round(max(15.0, frp * 0.8), 1), "level": "HIGH"},
            {"day": "Current", "status": f"Active {predicted_category}", "frp": frp, "level": risk_data["level"]}
        ]

        row["predicted_category"] = predicted_category
        row["confidence_score"] = confidence_pct
        row["nearest_facility_name"] = nearest_facility["name"] if min_dist <= 8.0 else "Regional Infrastructure Zone"
        row["nearest_facility_distance_km"] = round(min_dist, 2)
        row["refinery_dist_km"] = refinery_dist
        row["population_dist_km"] = population_dist
        row["highway_dist_km"] = highway_dist
        row["risk_score"] = risk_data["score"]
        row["risk_level"] = risk_data["level"]
        row["risk_color"] = risk_data["color"]
        row["risk_breakdown"] = risk_data["breakdown"]
        row["xai_reasons"] = [f"✓ {r}" for r in reasons]
        row["reasoning_summary"] = "; ".join(reasons)
        row["incident_timeline"] = timeline
        row["satellite_image_url"] = f"https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=600&q=80"
        return row

    def process_records(self, records):
        records = self.compute_temporal_persistence(records)
        return [self.classify_hotspot(r) for r in records]

if __name__ == "__main__":
    raw_records = generate_firms_hotspots()
    classifier = ThermalAnomalyClassifier()
    processed = classifier.process_records(raw_records)
    print(f"Successfully processed {len(processed)} records for ThermalGuard AI.")
    print("Sample record Risk Score:", processed[0]["risk_score"], "Category:", processed[0]["predicted_category"])

