from http.server import HTTPServer, SimpleHTTPRequestHandler
import json
import urllib.parse
import os
from config import Config
from database import save_hotspots, get_all_hotspots
from firms_api import fetch_live_firms_data
from sample_data_generator import KNOWN_FACILITIES
from classifier import ThermalAnomalyClassifier

PORT = Config.PORT
CLASSIFIER_ENGINE = ThermalAnomalyClassifier()
RAW_DATA = fetch_live_firms_data()
PROCESSED_DATA = CLASSIFIER_ENGINE.process_records(RAW_DATA)
save_hotspots(PROCESSED_DATA)

class SatelliteAPIHandler(SimpleHTTPRequestHandler):
    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        global RAW_DATA, PROCESSED_DATA
        parsed = urllib.parse.urlparse(self.path)
        path = parsed.path
        query = urllib.parse.parse_qs(parsed.query)

        if path == "/api/status":
            self._set_headers(200)
            res = {
                "status": "online",
                "system": "ThermalGuard AI Satellite Classification Engine",
                "version": "2.0.0",
                "firms_live_mode": Config.is_firms_live(),
                "endpoints": ["/api/hotspots", "/api/stats", "/api/facilities", "/api/config", "/api/refresh", "/api/sync-firms"]
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))

        elif path == "/api/config":
            self._set_headers(200)
            self.wfile.write(json.dumps(Config.get_status()).encode('utf-8'))

        elif path == "/api/sync-firms" or path == "/api/refresh":
            RAW_DATA = fetch_live_firms_data()
            PROCESSED_DATA = CLASSIFIER_ENGINE.process_records(RAW_DATA)
            save_hotspots(PROCESSED_DATA)
            self._set_headers(200)
            self.wfile.write(json.dumps({"status": "success", "count": len(PROCESSED_DATA), "live_mode": Config.is_firms_live()}).encode('utf-8'))

        elif path == "/api/hotspots":
            self._set_headers(200)
            data = PROCESSED_DATA
            
            # Category filter
            if "category" in query and query["category"][0] not in ["All", "All classes"]:
                cat = query["category"][0]
                data = [h for h in data if cat.lower() in h.get("predicted_category", "").lower()]
                
            # Search query filter
            if "q" in query and query["q"][0]:
                q_str = query["q"][0].lower()
                data = [
                    h for h in data
                    if q_str in str(h.get("latitude")).lower()
                    or q_str in str(h.get("longitude")).lower()
                    or q_str in str(h.get("satellite", "")).lower()
                    or q_str in str(h.get("predicted_category", "")).lower()
                    or q_str in str(h.get("nearest_facility_name", "")).lower()
                ]

            # Confidence filter
            if "min_confidence" in query:
                min_c = float(query["min_confidence"][0])
                data = [h for h in data if h.get("confidence_score", 0) >= min_c]

            # FRP filter
            if "min_frp" in query:
                min_f = float(query["min_frp"][0])
                data = [h for h in data if h.get("frp", 0) >= min_f]

            self.wfile.write(json.dumps({"count": len(data), "hotspots": data}).encode('utf-8'))

        elif path.startswith("/api/hotspots/"):
            hotspot_id = path.replace("/api/hotspots/", "")
            match = next((h for h in PROCESSED_DATA if str(h.get("id")) == hotspot_id or str(h.get("latitude")) == hotspot_id), None)
            if match:
                self._set_headers(200)
                self.wfile.write(json.dumps(match).encode('utf-8'))
            else:
                self._set_headers(404)
                self.wfile.write(json.dumps({"error": "Hotspot not found"}).encode('utf-8'))

        elif path == "/api/stats":
            self._set_headers(200)
            total = len(PROCESSED_DATA)
            total_frp = round(sum(h.get("frp", 0) for h in PROCESSED_DATA), 1)
            matches = sum(1 for h in PROCESSED_DATA if h.get("simulated_ground_truth") == h.get("predicted_category"))
            acc = round((matches / total) * 100, 1) if total > 0 else 0.0

            active_alerts = sum(1 for h in PROCESSED_DATA if h.get("risk_score", 0) >= 81)
            anomalies = sum(1 for h in PROCESSED_DATA if h.get("risk_score", 0) >= 61)
            industrial_fires = sum(1 for h in PROCESSED_DATA if h.get("predicted_category") == "Industrial Fire")
            normal_sources = sum(1 for h in PROCESSED_DATA if h.get("risk_score", 0) < 40)

            categories = {}
            for h in PROCESSED_DATA:
                cat = h.get("predicted_category", "Unknown / Anomalous")
                categories[cat] = categories.get(cat, 0) + 1

            res = {
                "total_detections": total,
                "total_frp_mw": total_frp,
                "classification_accuracy_pct": acc,
                "active_alerts": active_alerts,
                "anomalies_count": anomalies,
                "industrial_fires_count": industrial_fires,
                "normal_sources_count": normal_sources,
                "category_breakdown": categories
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))

        elif path == "/api/alerts":
            self._set_headers(200)
            alerts = [h for h in PROCESSED_DATA if h.get("risk_score", 0) >= 61]
            alerts.sort(key=lambda x: x.get("risk_score", 0), reverse=True)
            self.wfile.write(json.dumps({"count": len(alerts), "alerts": alerts[:10]}).encode('utf-8'))

        elif path == "/api/national-risk":
            self._set_headers(200)
            national_data = [
                {"state": "Gujarat", "risk_score": 91, "level": "CRITICAL", "color": "rose", "facilities": 348, "thermal_sources": 127, "active_anomalies": 13, "high_risk": 4, "persistent": 28},
                {"state": "Odisha", "risk_score": 85, "level": "CRITICAL", "color": "rose", "facilities": 210, "thermal_sources": 88, "active_anomalies": 9, "high_risk": 3, "persistent": 19},
                {"state": "Maharashtra", "risk_score": 64, "level": "HIGH", "color": "amber", "facilities": 412, "thermal_sources": 140, "active_anomalies": 7, "high_risk": 2, "persistent": 31},
                {"state": "Jharkhand", "risk_score": 58, "level": "MODERATE", "color": "violet", "facilities": 185, "thermal_sources": 72, "active_anomalies": 5, "high_risk": 1, "persistent": 14},
                {"state": "West Bengal", "risk_score": 28, "level": "LOW", "color": "emerald", "facilities": 290, "thermal_sources": 54, "active_anomalies": 2, "high_risk": 0, "persistent": 8}
            ]
            self.wfile.write(json.dumps({"states": national_data}).encode('utf-8'))

        elif path == "/api/facilities":
            self._set_headers(200)
            self.wfile.write(json.dumps({"count": len(KNOWN_FACILITIES), "facilities": KNOWN_FACILITIES}).encode('utf-8'))

        else:
            # Serve index.html or static files
            if path == "/" or path == "/index.html":
                filepath = os.path.join(os.path.dirname(__file__), "index.html")
                if os.path.exists(filepath):
                    self._set_headers(200, "text/html")
                    with open(filepath, "rb") as f:
                        self.wfile.write(f.read())
                    return
            # Fallback to SimpleHTTPRequestHandler for static assets
            super().do_GET()

def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, SatelliteAPIHandler)
    print(f"Satellite Intelligence HTTP Server running on http://localhost:{PORT}")
    httpd.serve_forever()

if __name__ == "__main__":
    run_server()

