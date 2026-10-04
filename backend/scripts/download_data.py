import os
import requests
import json
import time
from pathlib import Path

# Setup paths
BASE_DIR = Path(os.path.abspath(__file__)).parent.parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)
PROCESSED_DIR = BASE_DIR / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

COMMON_FILTER = " AND reviewed:true AND fragment:false AND length:[50 TO 1000]"

DATASETS = {
    "enzyme": "(keyword:KW-0378 OR keyword:KW-0808 OR keyword:KW-0560 OR keyword:KW-0456 OR keyword:KW-0413 OR keyword:KW-0436)" + COMMON_FILTER,
    "transport": "(keyword:KW-0813)" + COMMON_FILTER,
    "structural": "(go:0005198 AND NOT keyword:KW-0689)" + COMMON_FILTER,
    "regulatory": "(keyword:KW-0805)" + COMMON_FILTER,
    "defense": "(keyword:KW-0929 OR keyword:KW-0391 OR keyword:KW-0399 OR keyword:KW-0044)" + COMMON_FILTER
}

HUMAN_DISEASE_QUERY = "reviewed:true AND organism_id:9606 AND cc_disease:*"
HUMSAVAR_URL = "https://ftp.uniprot.org/pub/databases/uniprot/current_release/knowledgebase/variants/humsavar.txt"
HUMAN_SEQUENCES_QUERY = "reviewed:true AND organism_id:9606"

dataset_card = {}

def get_count_and_release(query):
    url = "https://rest.uniprot.org/uniprotkb/search"
    params = {"query": query, "size": 1}
    try:
        response = requests.get(url, params=params)
        if response.status_code == 200:
            total = int(response.headers.get("x-total-results", 0))
            release = response.headers.get("x-uniprot-release", "Unknown")
            return total, release
    except Exception as e:
        print(f"Error fetching count: {e}")
    return 0, "Unknown"

def download_stream(query, output_filename, fields):
    url = "https://rest.uniprot.org/uniprotkb/stream"
    params = {
        "format": "tsv",
        "compressed": "true",
        "query": query,
        "fields": fields
    }
    
    total, release = get_count_and_release(query)
    dataset_card[output_filename] = {"expected_count": total, "uniprot_release": release}
    
    print(f"Downloading {output_filename} (Expected: {total} records, Release: {release})...")
    output_path = RAW_DIR / output_filename
    
    with requests.get(url, params=params, stream=True) as r:
        r.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
    print(f"  -> Saved to {output_path}")

def download_humsavar():
    print("Downloading humsavar.txt...")
    output_path = RAW_DIR / "humsavar.txt"
    with requests.get(HUMSAVAR_URL, stream=True) as r:
        r.raise_for_status()
        with open(output_path, 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                if chunk:
                    f.write(chunk)
    print(f"  -> Saved to {output_path}")

def main():
    print("Starting strict data downloads...")
    dataset_card["download_date"] = time.strftime("%Y-%m-%d %H:%M:%S")
    
    fields_main = "accession,id,protein_name,gene_primary,organism_name,organism_id,length,sequence,keywordid,keyword,ec,go_f,protein_existence,annotation_score"
    
    for name, query in DATASETS.items():
        download_stream(query, f"{name}.tsv.gz", fields_main)
        time.sleep(1) # respect API
        
    download_stream(HUMAN_DISEASE_QUERY, "human_disease.tsv.gz", "accession,id,gene_primary,protein_name,length,sequence,cc_disease,xref_mim")
    time.sleep(1)
    
    download_stream(HUMAN_SEQUENCES_QUERY, "human_sequences.tsv.gz", "accession,sequence")
    
    download_humsavar()
    
    # Save dataset card base
    with open(PROCESSED_DIR / "dataset_card.json", "w") as f:
        json.dump(dataset_card, f, indent=4)
        
    print("All downloads complete!")

if __name__ == "__main__":
    main()
