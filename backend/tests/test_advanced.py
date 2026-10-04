import requests

BASE_URL = "http://127.0.0.1:8000"

def test_disease():
    print("\n--- Testing /api/advanced/disease_risk ---")
    seq = "QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ" # PolyQ
    resp = requests.post(f"{BASE_URL}/api/advanced/disease_risk", json={"sequence": seq})
    if resp.status_code == 200:
        data = resp.json()
        print(f"SUCCESS: Risk Level: {data.get('risk_level')}")
        print(f"Message: {data.get('message')}")
        for f in data.get('findings', []):
            print(f" -> {f['pathology']}: {f['motif']} ({f['severity']})")
        return True
    else:
        print(f"FAILED: {resp.text}")
        return False

def test_pdb():
    print("\n--- Testing /api/advanced/pdb/{uniprot_id} ---")
    resp = requests.get(f"{BASE_URL}/api/advanced/pdb/P00519")
    if resp.status_code == 200:
        print(f"SUCCESS: Fetched PDB file, length = {len(resp.text)} bytes")
        return True
    else:
        print(f"FAILED: {resp.text}")
        return False

if __name__ == "__main__":
    t1 = test_disease()
    t2 = test_pdb()
    if t1 and t2:
        print("\nALL NEW ENDPOINTS WORKING PERFECTLY!")
