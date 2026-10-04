import pandas as pd
import json
import os
from pathlib import Path

BASE_DIR = Path(os.path.abspath(__file__)).parent.parent.parent
RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

MAX_PER_CLASS = 4000
MAX_PER_ORGANISM_FRAC = 0.15

classes = ["enzyme", "transport", "structural", "regulatory", "defense"]

def load_data():
    dfs = []
    for cls in classes:
        file_path = RAW_DIR / f"{cls}.tsv.gz"
        print(f"Loading {cls}...")
        try:
            df = pd.read_csv(file_path, sep='\t', compression='gzip', low_memory=False)
            
            # Map columns
            col_map = {
                'Entry': 'protein_id', 
                'Entry Name': 'entry_name', 
                'Organism (ID)': 'organism_id', 
                'Sequence': 'sequence', 
                'Length': 'length'
            }
            # Keep only the columns we need if they exist
            cols_to_keep = [c for c in col_map.keys() if c in df.columns]
            df = df[cols_to_keep].rename(columns=col_map)
            
            df['function_class'] = cls
            df['source_query'] = cls
            dfs.append(df)
        except Exception as e:
            print(f"Error loading {cls}: {e}")
            
    return pd.concat(dfs, ignore_index=True) if dfs else pd.DataFrame()

def main():
    print("Building dataset...")
    card_path = PROCESSED_DIR / "dataset_card.json"
    if card_path.exists():
        with open(card_path, "r") as f:
            card = json.load(f)
    else:
        card = {}
        
    df = load_data()
    if df.empty:
        print("No data loaded.")
        return
        
    initial_counts = df['function_class'].value_counts().to_dict()
    card["raw_counts"] = initial_counts
    
    # 1. Drop sequences with multiple classes (Ambiguous)
    class_counts_per_protein = df.groupby('protein_id')['function_class'].nunique()
    ambiguous_ids = class_counts_per_protein[class_counts_per_protein > 1].index
    card["dropped_ambiguous_proteins"] = len(ambiguous_ids)
    
    df = df[~df['protein_id'].isin(ambiguous_ids)]
    
    # 2. Sequence Deduplication
    seq_class_counts = df.groupby('sequence')['function_class'].nunique()
    conflicting_seqs = seq_class_counts[seq_class_counts > 1].index
    card["dropped_conflicting_sequences"] = len(conflicting_seqs)
    
    df = df[~df['sequence'].isin(conflicting_seqs)]
    
    before_dedup = len(df)
    df = df.drop_duplicates(subset=['sequence'])
    card["dropped_exact_sequence_duplicates"] = before_dedup - len(df)
    
    # 3. Class balancing & Organism capping
    final_dfs = []
    for cls in classes:
        class_df = df[df['function_class'] == cls].copy()
        max_org = int(MAX_PER_CLASS * MAX_PER_ORGANISM_FRAC)
        
        class_df = class_df.sample(frac=1, random_state=42) # shuffle
        
        sampled = []
        org_counts = {}
        for _, row in class_df.iterrows():
            org = row['organism_id']
            if org_counts.get(org, 0) < max_org:
                sampled.append(row)
                org_counts[org] = org_counts.get(org, 0) + 1
            if len(sampled) >= MAX_PER_CLASS:
                break
                
        final_dfs.append(pd.DataFrame(sampled))
        
    final_df = pd.concat(final_dfs, ignore_index=True)
    card["final_counts"] = final_df['function_class'].value_counts().to_dict()
    
    output_path = PROCESSED_DIR / "labeled_proteins.csv"
    final_df.to_csv(output_path, index=False)
    
    with open(card_path, "w") as f:
        json.dump(card, f, indent=4)
        
    print(f"Dataset successfully built and saved to {output_path}")
    print("Final counts:")
    print(json.dumps(card["final_counts"], indent=2))

if __name__ == "__main__":
    main()
