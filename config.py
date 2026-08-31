import os

def load_dotenv_file(filepath=".env"):
    if not os.path.exists(filepath):
        return
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            os.environ[key.strip()] = val.strip()

# Load .env file
load_dotenv_file()

class Config:
    NASA_FIRMS_MAP_KEY = os.environ.get("NASA_FIRMS_MAP_KEY", "").strip()
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "").strip()
    DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///thermalguard.db").strip()
    PORT = int(os.environ.get("PORT", "8000"))

    @classmethod
    def is_firms_live(cls):
        return bool(cls.NASA_FIRMS_MAP_KEY)

    @classmethod
    def get_status(cls):
        return {
            "firms_key_configured": bool(cls.NASA_FIRMS_MAP_KEY),
            "firms_mode": "LIVE_NASA_API" if cls.NASA_FIRMS_MAP_KEY else "SIMULATION_FALLBACK",
            "openai_key_configured": bool(cls.OPENAI_API_KEY),
            "database_url": cls.DATABASE_URL,
            "port": cls.PORT
        }
