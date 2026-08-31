import sqlite3
import json
import os

DB_FILE = "thermalguard.db"

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    # Create Hotspots table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS hotspots (
            id TEXT PRIMARY KEY,
            latitude REAL,
            longitude REAL,
            category TEXT,
            confidence REAL,
            frp REAL,
            risk_score INTEGER,
            risk_level TEXT,
            facility_name TEXT,
            data_json TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # Create Alerts table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS alerts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            hotspot_id TEXT,
            title TEXT,
            risk_score INTEGER,
            status TEXT,
            dispatched_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    conn.commit()
    conn.close()

def save_hotspots(hotspots):
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    for h in hotspots:
        hid = h.get("hotspot_id", str(h.get("latitude")) + "_" + str(h.get("longitude")))
        cursor.execute('''
            INSERT OR REPLACE INTO hotspots 
            (id, latitude, longitude, category, confidence, frp, risk_score, risk_level, facility_name, data_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            hid,
            h.get("latitude"),
            h.get("longitude"),
            h.get("predicted_category"),
            h.get("confidence_score"),
            h.get("frp"),
            h.get("risk_score", 50),
            h.get("risk_level", "MODERATE"),
            h.get("nearest_facility_name"),
            json.dumps(h)
        ))

    conn.commit()
    conn.close()

def get_all_hotspots():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute('SELECT data_json FROM hotspots')
    rows = cursor.fetchall()
    conn.close()

    result = []
    for r in rows:
        try:
            result.append(json.loads(r[0]))
        except Exception:
            pass
    return result

# Initialize tables on import
init_db()
