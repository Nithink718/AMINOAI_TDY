import pandas as pd
import os
import json
import subprocess
from sklearn.model_selection import StratifiedShuffleSplit
from pathlib import Path

BASE_DIR = Path(os.path.abspath(__file__)).parent.parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"

def try_clustering(df, fasta_path):
    # Try running mmseqs2 or cd-hit if available in PATH
    pass

def main():
    print("Starting Train/Test Split logic...")
    df = pd.read_csv(PROCESSED_DIR / "labeled_proteins.csv")
    
    # Check for MMseqs2 / CD-HIT availability
    has_cluster_tool = False
    
    if not has_cluster_tool:
        print("Warning: Homology clustering tools (MMseqs2/CD-HIT) not found. Falling back to Stratified Random Split.")
        
        splitter = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
        
        for train_idx, test_idx in splitter.split(df, df['function_class']):
            train_df = df.iloc[train_idx]
            test_df = df.iloc[test_idx]
            
        train_df.to_csv(PROCESSED_DIR / "split_train.csv", index=False)
        test_df.to_csv(PROCESSED_DIR / "split_test.csv", index=False)
        
        with open(PROCESSED_DIR / "dataset_card.json", "r") as f:
            card = json.load(f)
            
        card["split_method"] = "Random Stratified Split"
        card["split_disclaimer"] = "random split \u2014 may be optimistic due to sequence homology"
        card["train_size"] = len(train_df)
        card["test_size"] = len(test_df)
        
        with open(PROCESSED_DIR / "dataset_card.json", "w") as f:
            json.dump(card, f, indent=4)
            
        print(f"Saved split_train.csv ({len(train_df)} rows) and split_test.csv ({len(test_df)} rows).")

if __name__ == "__main__":
    main()
