import urllib.request
import urllib.error
import csv
import io
import json
from datetime import datetime
from config import Config
from sample_data_generator import generate_firms_hotspots

def fetch_live_firms_data(map_key=None, area="68,8,97,37", day_range=1):
    key = map_key if map_key else Config.NASA_FIRMS_MAP_KEY
    if not key:
        print("[FIRMS API] No NASA_FIRMS_MAP_KEY configured. Using high-fidelity simulation engine.")
        return generate_firms_hotspots()

    # NASA FIRMS Area API URL
    url = f"https://firms.modaps.eosdis.nasa.gov/api/area/csv/{key}/VIIRS_SNPP_NRT/{area}/{day_range}"
    print(f"[FIRMS API] Querying live NASA FIRMS API: {url}")

    try:
        req = urllib.request.Request(url, headers={"User-Agent": "ThermalGuardAI/1.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            content = resp.read().decode('utf-8')
            
            reader = csv.DictReader(io.StringIO(content))
            records = []
            hotspot_counter = 50001
            for row in reader:
                lat = float(row.get("latitude", 0))
                lon = float(row.get("longitude", 0))
                frp = float(row.get("frp", 15.0))
                bright_ti4 = float(row.get("bright_ti4", 320.0))
                bright_ti5 = float(row.get("bright_ti5", 300.0))

                records.append({
                    "hotspot_id": f"NASA-{hotspot_counter}",
                    "latitude": lat,
                    "longitude": lon,
                    "brightness_ti4": bright_ti4,
                    "brightness_ti5": bright_ti5,
                    "frp": frp,
                    "acq_date": row.get("acq_date", datetime.utcnow().strftime("%Y-%m-%d")),
                    "acq_time": row.get("acq_time", "1200"),
                    "satellite": row.get("satellite", "VIIRS_NPP"),
                    "confidence": row.get("confidence", "n"),
                    "daynight": row.get("daynight", "D"),
                    "simulated_ground_truth": "Live NASA Detection",
                    "facility_name": None
                })
                hotspot_counter += 1

            print(f"[FIRMS API] Successfully retrieved {len(records)} live satellite hotspots from NASA.")
            return records if records else generate_firms_hotspots()

    except Exception as e:
        print(f"[FIRMS API Warning] Error fetching live NASA data ({e}). Falling back to simulation engine.")
        return generate_firms_hotspots()
