import math
import random
from datetime import datetime, timedelta

KNOWN_FACILITIES = [
    {"name": "Jamnagar Reliance Refinery Complex", "lat": 22.4700, "lon": 69.0700, "type": "Industrial Fire", "country": "India", "region": "Gujarat"},
    {"name": "Jamnagar Flare Stack Flare-A4", "lat": 22.4750, "lon": 69.0750, "type": "Gas Flare", "country": "India", "region": "Gujarat"},
    {"name": "Hazira Petrochemical Complex", "lat": 21.1167, "lon": 72.6500, "type": "Industrial Facility", "country": "India", "region": "Gujarat"},
    {"name": "Bokaro Steel Plant Blast Furnace", "lat": 23.6700, "lon": 86.1500, "type": "Industrial Facility", "country": "India", "region": "Jharkhand"},
    {"name": "Paradeep Refinery & Terminal", "lat": 20.2700, "lon": 86.6700, "type": "Industrial Fire", "country": "India", "region": "Odisha"},
    {"name": "Jharia Coalfield Mining Area", "lat": 23.7500, "lon": 86.4200, "type": "Mining Thermal Activity", "country": "India", "region": "Jharkhand"},
    {"name": "Permian Basin Flare Stack Alpha", "lat": 31.8901, "lon": -102.3241, "type": "Gas Flare", "country": "USA", "region": "Texas"},
    {"name": "Ghawar Processing Complex", "lat": 25.4320, "lon": 49.6120, "type": "Gas Flare", "country": "Saudi Arabia", "region": "Eastern Province"},
]

REGIONAL_WILDFIRE_ZONES = [
    {"name": "Western Ghats Forest Zone", "center_lat": 14.50, "center_lon": 74.80, "radius_deg": 0.35, "country": "India", "region": "Karnataka"},
    {"name": "Simlipal Tiger Reserve Canopy", "center_lat": 21.90, "center_lon": 86.30, "radius_deg": 0.40, "country": "India", "region": "Odisha"},
]

AGRICULTURAL_ZONES = [
    {"name": "Punjab Stubble Burning Belt", "center_lat": 30.90, "center_lon": 75.85, "radius_deg": 0.40, "country": "India", "region": "Punjab"},
    {"name": "Haryana Field Residue Sector", "center_lat": 29.50, "center_lon": 76.50, "radius_deg": 0.30, "country": "India", "region": "Haryana"},
]

def generate_firms_hotspots(days=14, seed=42):
    random.seed(seed)
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    records = []
    hotspot_id_counter = 10001

    for facility in KNOWN_FACILITIES:
        passes = random.randint(12, 24)
        for _ in range(passes):
            time_offset_hours = random.uniform(0, days * 24)
            acq_datetime = start_date + timedelta(hours=time_offset_hours)
            if facility["type"] == "Gas Flare":
                bright_ti4 = round(random.uniform(345.0, 375.0), 1)
                bright_ti5 = round(random.uniform(310.0, 340.0), 1)
                frp = round(random.uniform(45.0, 180.0), 1)
            elif facility["type"] == "Mining/Quarry":
                bright_ti4 = round(random.uniform(315.0, 335.0), 1)
                bright_ti5 = round(random.uniform(295.0, 310.0), 1)
                frp = round(random.uniform(12.0, 40.0), 1)
            else:
                bright_ti4 = round(random.uniform(330.0, 355.0), 1)
                bright_ti5 = round(random.uniform(300.0, 325.0), 1)
                frp = round(random.uniform(25.0, 95.0), 1)

            lat_jitter = random.gauss(0, 0.0015)
            lon_jitter = random.gauss(0, 0.0015)

            records.append({
                "hotspot_id": f"SAT-{hotspot_id_counter}",
                "latitude": round(facility["lat"] + lat_jitter, 5),
                "longitude": round(facility["lon"] + lon_jitter, 5),
                "brightness_ti4": bright_ti4,
                "brightness_ti5": bright_ti5,
                "frp": frp,
                "acq_date": acq_datetime.strftime("%Y-%m-%d"),
                "acq_time": acq_datetime.strftime("%H%M"),
                "acq_timestamp": acq_datetime.isoformat(),
                "satellite": random.choice(["VIIRS_NPP", "VIIRS_NOAA20", "MODIS_Aqua"]),
                "confidence": random.choice(["h", "n"]),
                "daynight": "N" if (acq_datetime.hour < 6 or acq_datetime.hour > 18) else "D",
                "simulated_ground_truth": facility["type"],
                "facility_name": facility["name"]
            })
            hotspot_id_counter += 1

    for wf in REGIONAL_WILDFIRE_ZONES:
        wf_start = start_date + timedelta(days=random.uniform(1, days - 5))
        num_wf_points = random.randint(35, 55)
        for i in range(num_wf_points):
            acq_datetime = wf_start + timedelta(days=(i / num_wf_points) * 4)
            lat = wf["center_lat"] + random.gauss(0, 0.04)
            lon = wf["center_lon"] + random.gauss(0, 0.04)

            records.append({
                "hotspot_id": f"SAT-{hotspot_id_counter}",
                "latitude": round(lat, 5),
                "longitude": round(lon, 5),
                "brightness_ti4": round(random.uniform(325.0, 360.0), 1),
                "brightness_ti5": round(random.uniform(295.0, 320.0), 1),
                "frp": round(random.uniform(20.0, 320.0), 1),
                "acq_date": acq_datetime.strftime("%Y-%m-%d"),
                "acq_time": acq_datetime.strftime("%H%M"),
                "acq_timestamp": acq_datetime.isoformat(),
                "satellite": random.choice(["VIIRS_NPP", "MODIS_Terra"]),
                "confidence": random.choice(["h", "n", "l"]),
                "daynight": "D" if (6 <= acq_datetime.hour <= 18) else "N",
                "simulated_ground_truth": "Wildfire",
                "facility_name": None
            })
            hotspot_id_counter += 1

    for ag in AGRICULTURAL_ZONES:
        num_ag_points = random.randint(20, 35)
        for _ in range(num_ag_points):
            acq_datetime = start_date + timedelta(hours=random.uniform(0, days * 24))
            lat = ag["center_lat"] + random.uniform(-ag["radius_deg"], ag["radius_deg"])
            lon = ag["center_lon"] + random.uniform(-ag["radius_deg"], ag["radius_deg"])

            records.append({
                "hotspot_id": f"SAT-{hotspot_id_counter}",
                "latitude": round(lat, 5),
                "longitude": round(lon, 5),
                "brightness_ti4": round(random.uniform(310.0, 335.0), 1),
                "brightness_ti5": round(random.uniform(290.0, 310.0), 1),
                "frp": round(random.uniform(5.0, 30.0), 1),
                "acq_date": acq_datetime.strftime("%Y-%m-%d"),
                "acq_time": acq_datetime.strftime("%H%M"),
                "acq_timestamp": acq_datetime.isoformat(),
                "satellite": "VIIRS_NPP",
                "confidence": "n",
                "daynight": "D",
                "simulated_ground_truth": "Agricultural Burning",
                "facility_name": None
            })
            hotspot_id_counter += 1

    return records
