# Thermal Hotspot AI - Orbital Intelligence Dashboard

A full-stack satellite thermal anomaly intelligence system that processes FIRMS data (VIIRS/MODIS format), calculates spatial persistence, evaluates proximity to known industrial facilities, and classifies thermal signatures (Industrial Fire, Gas Flare, Wildfire, Agricultural Burning, Mining Thermal Activity).

The project combines a **Python Intelligence & Analytics Engine** with an interactive **React + TypeScript + Tailwind GIS Dashboard**.

## Key Features

- **Thermal Anomaly Classifier Engine**: High-resolution classification using Haversine distance, temporal persistence counting, brightness temperature differential (TI4/TI5), and Fire Radiative Power (FRP).
- **Satellite Data Stream Simulator & NASA FIRMS Sync**: Generates realistic FIRMS satellite passes across key industrial clusters or connects directly to live NASA FIRMS feeds.
- **Cosmic Web Dashboard**: Responsive midnight-blue tactical dashboard with interactive Leaflet GIS maps, live telemetry metrics, signal queues, category filtering, search, and AI classification reasoning chains.
- **Full-Stack REST API**: Endpoints for hotspots, telemetry stats, infrastructure facilities, risk analysis, and real-time refresh.
- **Production & Serverless Ready**: Native support for running locally via Python HTTP server or deploying to Vercel with zero configuration.

---

## Quickstart & How to Run

### Prerequisites
- **Python 3.8+**
- **Node.js 18+** & **npm**

### 1. Install Frontend Dependencies & Build Dashboard

```bash
# Install node packages
npm install

# Compile the dashboard into production bundle (dist/)
npm run build
```

### 2. Run the Full-Stack Server

```bash
# Launch the Python HTTP API & Web Dashboard Server
python main.py
```

Open your browser and navigate to:
```
http://localhost:8000
```

---

## Local Development Mode

If you are actively developing the React UI with hot reloading:

1. In terminal 1, start the Python backend on port 8000:
   ```bash
   python main.py
   ```

2. In terminal 2, launch the Vite dev server on port 3000:
   ```bash
   npm run dev
   ```

3. Open `http://localhost:3000`. API requests to `/api/*` are automatically proxied to the Python backend.

---

## Vercel Deployment

This project is configured for seamless deployment on [Vercel](https://vercel.com):

1. Push your code to GitHub.
2. Import the repository into your Vercel account.
3. Vercel automatically detects Vite, runs `npm run build`, and routes `/api/*` requests to the serverless Python function in `api/index.py`.
4. (Optional) Set your environment variables in the Vercel project settings:
   - `NASA_FIRMS_MAP_KEY`: Your NASA FIRMS MAP API key.
   - `OPENAI_API_KEY`: (Optional) For external LLM reasoning.

---

## Configuration & Environment Variables

Copy `.env.example` to `.env` to configure your credentials:

```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Local server port for `main.py` | `8000` |
| `NASA_FIRMS_MAP_KEY` | NASA FIRMS MAP API Key (enables live satellite queries) | (Simulation engine) |
| `DATABASE_URL` | SQLite database URI | `sqlite:///thermalguard.db` |
| `OPENAI_API_KEY` | OpenAI API key for extended analysis | `""` |

---

## REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/status` | System health check and available endpoints |
| `GET` | `/api/config` | Engine configuration and NASA FIRMS connection status |
| `GET` | `/api/hotspots` | Retrieve classified hotspot records (supports `?category=`, `?q=`, `?min_confidence=`, `?min_frp=`) |
| `GET` | `/api/hotspots/<id>` | Retrieve detailed telemetry and explanation for a specific hotspot |
| `GET` | `/api/stats` | Telemetry summaries, total FRP, accuracy metrics, and category breakdown |
| `GET` | `/api/alerts` | Active high-risk anomaly alerts (`risk_score >= 61`) |
| `GET` | `/api/national-risk` | State-level thermal hazard and risk scores |
| `GET` | `/api/facilities` | Reference database of known industrial infrastructure facilities |
| `GET` / `POST` | `/api/refresh` | Re-generate satellite passes and re-run anomaly classification |
| `GET` / `POST` | `/api/sync-firms` | Trigger live NASA FIRMS synchronization |

---

## Project Structure

```
├── api/
│   └── index.py               # Vercel serverless entrypoint
├── src/
│   ├── components/            # Tactical dashboard UI components
│   ├── services/              # FIRMS data fetcher, AI classifier & alert engine
│   ├── styles/                # Tailwind CSS styles and themes
│   ├── types/                 # TypeScript interfaces and definitions
│   ├── App.tsx                # Main tactical application shell
│   └── main.tsx               # React DOM root mounting
├── classifier.py              # Rule & spatial anomaly classification engine
├── config.py                  # Environment and configuration loader
├── database.py                # SQLite persistence layer
├── firms_api.py               # NASA FIRMS API integration & fallback client
├── sample_data_generator.py   # High-fidelity FIRMS satellite stream generator
├── main.py                    # Production HTTP server serving API & static UI
├── vite.config.ts             # Vite configuration with API proxy
├── tsconfig.json              # TypeScript compiler settings
├── vercel.json                # Vercel deployment configuration
└── package.json               # Frontend dependencies and scripts
```
