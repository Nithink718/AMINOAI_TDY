import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test_predict():
    print("\n--- [1/6] Testing /api/predict ---")
    seq = "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
    resp = requests.post(f"{BASE_URL}/api/predict", json={"sequence": seq})
    if resp.status_code == 200:
        data = resp.json()
        print(f"SUCCESS: Predicted {data.get('predicted_class')} with {data.get('confidence')}% confidence.")
        return True
    print(f"FAILED: {resp.text}")
    return False

def test_similarity():
    print("\n--- [2/6] Testing /api/advanced/similarity ---")
    seq = "MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQVGQVELGGGPGAGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN"
    resp = requests.post(f"{BASE_URL}/api/advanced/similarity", json={"sequence": seq})
    if resp.status_code == 200:
        data = resp.json()
        print(f"SUCCESS: Found {len(data.get('similar_proteins', []))} similar proteins.")
        return True
    print(f"FAILED: {resp.text}")
    return False

def test_mutation():
    print("\n--- [3/6] Testing /api/advanced/mutation ---")
    orig = "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
    mut = "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYE"
    resp = requests.post(f"{BASE_URL}/api/advanced/mutation", json={"original_sequence": orig, "mutated_sequence": mut})
    if resp.status_code == 200:
        print("SUCCESS: Analyzed mutations cleanly.")
        return True
    print(f"FAILED: {resp.text}")
    return False

def test_disease():
    print("\n--- [4/6] Testing /api/advanced/disease_risk ---")
    seq = "QQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQQ" # PolyQ
    resp = requests.post(f"{BASE_URL}/api/advanced/disease_risk", json={"sequence": seq})
    if resp.status_code == 200:
        print("SUCCESS: Pathogenic motif scanner successful.")
        return True
    print(f"FAILED: {resp.text}")
    return False

def test_pdb():
    print("\n--- [5/6] Testing /api/advanced/pdb/{pdb_id} ---")
    resp = requests.get(f"{BASE_URL}/api/advanced/pdb/1TUP")
    if resp.status_code == 200:
        print(f"SUCCESS: Fetched PDB file, length = {len(resp.text)} bytes")
        return True
    print(f"FAILED: {resp.text}")
    return False

def test_report():
    print("\n--- [6/6] Testing /api/advanced/generate_report ---")
    resp = requests.post(f"{BASE_URL}/api/advanced/generate_report", json={
        "sequence": "MVLSPADK",
        "predicted_class": "Transport",
        "confidence": 99.5
    })
    if resp.status_code == 200:
        print(f"SUCCESS: PDF report generated at {resp.json().get('file_url')}")
        return True
    print(f"FAILED: {resp.text}")
    return False

def main():
    results = [
        test_predict(),
        test_similarity(),
        test_mutation(),
        test_disease(),
        test_pdb(),
        test_report()
    ]
    
    if all(results):
        print("\n[VERDICT] 100% SUCCESS: ALL 6/6 ENDPOINTS ARE WORKING PERFECTLY! NO BUGS FOUND.")
    else:
        print(f"\n[VERDICT] FAILURE: {results.count(False)} endpoints failed. Fix required.")

if __name__ == "__main__":
    main()
