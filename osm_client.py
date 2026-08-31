import urllib.request
import urllib.parse
import json

OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def query_osm_industrial_proximity(lat, lon, radius_m=5000):
    query = f"""
    [out:json][timeout:5];
    (
      node["landuse"="industrial"](around:{radius_m},{lat},{lon});
      way["landuse"="industrial"](around:{radius_m},{lat},{lon});
      node["man_made"="petroleum_well"](around:{radius_m},{lat},{lon});
      node["industrial"](around:{radius_m},{lat},{lon});
    );
    out center 5;
    """
    try:
        data = urllib.parse.urlencode({'data': query}).encode('utf-8')
        req = urllib.request.Request(OVERPASS_URL, data=data, headers={"User-Agent": "ThermalGuardAI/1.0"})
        with urllib.request.urlopen(req, timeout=4) as resp:
            res = json.loads(resp.read().decode('utf-8'))
            elements = res.get("elements", [])
            if elements:
                return {
                    "osm_found": True,
                    "count": len(elements),
                    "first_element_name": elements[0].get("tags", {}).get("name", "Industrial Feature")
                }
    except Exception as e:
        pass
    return {"osm_found": False, "count": 0}
