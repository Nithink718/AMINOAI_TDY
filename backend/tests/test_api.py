import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def wait_for_server():
    for _ in range(10):
        try:
            resp = requests.get(BASE_URL + "/")
            if resp.status_code == 200:
                print("Server is online!")
                return True
        except:
            time.sleep(1)
    return False

def test_predict():
    print("\n--- Testing /api/predict ---")
    seq = "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
    resp = requests.post(f"{BASE_URL}/api/predict", json={"sequence": seq})
    if resp.status_code == 200:
        data = resp.json()
        print(f"SUCCESS: Predicted {data.get('predicted_class')} with {data.get('confidence')}% confidence.")
        return True
    else:
        print(f"FAILED: {resp.text}")
        return False

def test_similarity():
    print("\n--- Testing /api/advanced/similarity ---")
    seq = "MALWMRLLPLLALLALWGPDPAAAFVNQHLCGSHLVEALYLVCGERGFFYTPKTRREAEDLQVGQVELGGGPGAGSLQPLALEGSLQKRGIVEQCCTSICSLYQLENYCN"
    resp = requests.post(f"{BASE_URL}/api/advanced/similarity", json={"sequence": seq})
    if resp.status_code == 200:
        data = resp.json()
        print(f"SUCCESS: Found {len(data.get('similar_proteins', []))} similar proteins.")
        for p in data['similar_proteins']:
            print(f"  -> {p['entry_name']} (Score: {p['similarity_score']})")
        return True
    else:
        print(f"FAILED: {resp.text}")
        return False

def test_mutation():
    print("\n--- Testing /api/advanced/mutation ---")
    orig = "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR"
    mut = "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYE"
    resp = requests.post(f"{BASE_URL}/api/advanced/mutation", json={
        "original_sequence": orig,
        "mutated_sequence": mut
    })
    if resp.status_code == 200:
        data = resp.json()
        print(f"SUCCESS: Analyzed {data.get('mutation_count')} mutations.")
        print(f"  -> BLOSUM62 Score: {data.get('cumulative_blosum_score')}")
        print(f"  -> Impact: {data.get('estimated_impact')}")
        return True
    else:
        print(f"FAILED: {resp.text}")
        return False

def main():
    if not wait_for_server():
        print("Backend server is not reachable. Is uvicorn running?")
        return
    
    s1 = test_predict()
    s2 = test_similarity()
    s3 = test_mutation()
    
    if s1 and s2 and s3:
        print("\nALL ENDPOINTS VERIFIED WORKING FLAWLESSLY! 🚀")
    else:
        print("\nSOME TESTS FAILED! ❌")

if __name__ == "__main__":
    main()
