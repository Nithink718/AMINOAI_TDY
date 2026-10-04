import pandas as pd
import numpy as np
import os
from pathlib import Path
from sklearn.feature_extraction.text import TfidfVectorizer
import scipy.sparse

BASE_DIR = Path(os.path.abspath(__file__)).parent.parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
REF_DIR = BASE_DIR / "data" / "reference"
REF_DIR.mkdir(parents=True, exist_ok=True)

def get_kmers(seq, k=3):
    return [seq[i:i+k] for i in range(len(seq) - k + 1)]

def dummy_analyzer(text):
    # text is already a list of kmers
    return text

def main():
    print("Building Similarity Reference Set...")
    
    df = pd.read_csv(PROCESSED_DIR / "labeled_proteins.csv")
    
    # Save the reference DB
    df.to_csv(REF_DIR / "reference_proteins.csv", index=False)
    
    # Build K-mer TF-IDF Matrix (k=3 as requested in the prompt)
    print("Computing 3-mer TF-IDF matrix for fast similarity search...")
    kmer_lists = df['sequence'].apply(lambda x: get_kmers(str(x), k=3)).tolist()
    
    vectorizer = TfidfVectorizer(analyzer=dummy_analyzer)
    tfidf_matrix = vectorizer.fit_transform(kmer_lists)
    
    # Save sparse matrix
    scipy.sparse.save_npz(REF_DIR / "reference_kmer.npz", tfidf_matrix)
    
    import joblib
    joblib.dump(vectorizer, REF_DIR / "reference_vectorizer.joblib")
    
    print(f"Reference set built! Saved to {REF_DIR}")
    print(f"Matrix shape: {tfidf_matrix.shape}")

if __name__ == "__main__":
    main()
