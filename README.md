# Thermal Hotspot AI - Orbital Intelligence Dashboard

A full-stack satellite thermal anomaly intelligence system that processes FIRMS data (VIIRS/MODIS format), calculates spatial persistence, evaluates proximity to known industrial facilities, and classifies thermal signatures (Gas Flare, Industrial Facility, Wildfire, Agricultural Burning, Mining).

## Features
- **Thermal Anomaly Classifier Engine**: High-resolution classification using Haversine distance, temporal persistence counting, brightness temperature differential (TI4/TI5), and Fire Radiative Power (FRP).
- **Satellite Data Stream Simulator**: Generates realistic FIRMS satellite passes across key industrial clusters and geographic sectors.
- **Cosmic Web Dashboard**: Responsive midnight blue visual dashboard displaying geospatial thermal fields, live telemetry metrics, signal queues, category filtering, search, and AI classification reasoning chains.
- **REST API Endpoints**: `/api/status`, `/api/hotspots`, `/api/stats`, `/api/facilities`, `/api/refresh`.

---

## How to Run

1. Start the HTTP API & Web Dashboard Server:
   ```bash
   python main.py
   ```

2. Open your web browser and navigate to:
   ```
   http://localhost:8000
   ```

---

## Project Structure

```
d:\abc\
├── main.py                  # HTTP server serving REST API and Web Dashboard
├── classifier.py            # Rule & spatial distance-based anomaly classifier
├── sample_data_generator.py # FIRMS satellite data simulation engine
├── index.html               # Responsive React + Tailwind cosmic web dashboard
├── src/                     # Modular TypeScript & React dashboard component source files
└── venv/                    # Python virtual environment
```

---

## API Endpoints

- `GET /api/status`: System status and available endpoints.
- `GET /api/hotspots`: Retrieve classified hotspot records (supports `?category=`, `?q=`, `?min_confidence=`, `?min_frp=`).
- `GET /api/hotspots/<id>`: Retrieve single hotspot record details.
- `GET /api/stats`: Telemetry metric summaries, total FRP, accuracy metrics, and category breakdown.
- `GET /api/facilities`: Reference list of known industrial infrastructure facilities.
- `GET /api/refresh`: Re-generate a fresh FIRMS satellite pass and re-run classification.
