import requests
import pandas as pd
import time
import os

CLASSES = {
    "Enzyme": "(keyword:KW-0238) AND (reviewed:true) AND (length:[50 TO 1500])",
    "Transport Protein": "(keyword:KW-0813) AND (reviewed:true) AND (length:[50 TO 1500])",
    "Structural Protein": "(keyword:KW-0761) AND (reviewed:true) AND (length:[50 TO 1500])",
    "Regulatory Protein": "(keyword:KW-0804) OR (keyword:KW-0675) AND (reviewed:true) AND (length:[50 TO 1500])",
    "Defense Protein": "(keyword:KW-0205) OR (keyword:KW-0800) AND (reviewed:true) AND (length:[50 TO 1500])"
}

BASE_URL = "https://rest.uniprot.org/uniprotkb/stream"
MAX_RECORDS_PER_CLASS = 4000

def fetch_data(class_name, query):
    print(f"Fetching data for {class_name}...")
    params = {
        "query": query,
        "format": "tsv",
        "fields": "accession,sequence"
    }
    
    response = requests.get(BASE_URL, params=params, stream=True)
    
    if response.status_code == 200:
        data = []
        lines = response.iter_lines(decode_unicode=True)
        try:
            next(lines) # skip header
        except StopIteration:
            print("  -> No records found.")
            return []
            
        for line in lines:
            if not line: continue
            parts = line.split("\t")
            if len(parts) >= 2:
                data.append({"protein_id": parts[0], "sequence": parts[1], "function_class": class_name})
            if len(data) >= MAX_RECORDS_PER_CLASS:
                break
                
        print(f"  -> Successfully fetched {len(data)} records.")
        return data
    else:
        print(f"  -> Error fetching data for {class_name}. Status: {response.status_code}")
        print(response.text)
        return []

def main():
    print("Starting massive data fetching from UniProt API (Stream Endpoint)...")
    all_data = []
    for class_name, query in CLASSES.items():
        data = fetch_data(class_name, query)
        all_data.extend(data)
        time.sleep(1)
        
    df = pd.DataFrame(all_data)
    
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'raw'))
    os.makedirs(output_dir, exist_ok=True)
    
    output_file = os.path.join(output_dir, "uniprot_dataset.csv")
    df.to_csv(output_file, index=False)
    
    print(f"\nDataset successfully saved to {output_file}")
    print("Class distribution:")
    print(df['function_class'].value_counts())

if __name__ == "__main__":
    main()
