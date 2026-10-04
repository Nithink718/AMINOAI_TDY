import pandas as pd
import scipy.sparse
import joblib
from sklearn.metrics.pairwise import cosine_similarity
import os
from pathlib import Path

BASE_DIR = Path(os.path.abspath(__file__)).parent.parent.parent
REF_DIR = BASE_DIR / "data" / "reference"

class SimilarityEngine:
    def __init__(self):
        self.reference_df = None
        self.reference_matrix = None
        self.vectorizer = None
        self.loaded = False
        
    def load(self):
        try:
            import __main__
            def dummy_analyzer(text): return text
            __main__.dummy_analyzer = dummy_analyzer
            
            self.reference_df = pd.read_csv(REF_DIR / "reference_proteins.csv")
            self.reference_matrix = scipy.sparse.load_npz(REF_DIR / "reference_kmer.npz")
            self.vectorizer = joblib.load(REF_DIR / "reference_vectorizer.joblib")
            self.loaded = True
        except Exception as e:
            print(f"Failed to load similarity reference: {e}")
            
    def get_kmers(self, seq, k=3):
        return [seq[i:i+k] for i in range(len(seq) - k + 1)]

    def search(self, sequence: str, top_n: int = 5):
        if not self.loaded:
            self.load()
            if not self.loaded:
                return []
                
        seq = sequence.upper().strip()
        query_kmers = self.get_kmers(seq)
        query_vector = self.vectorizer.transform([query_kmers])
        
        # Cosine similarity
        similarities = cosine_similarity(query_vector, self.reference_matrix)[0]
        
        # Get top N indices
        top_indices = similarities.argsort()[-top_n:][::-1]
        
        results = []
        for idx in top_indices:
            row = self.reference_df.iloc[idx]
            sim_score = similarities[idx]
            results.append({
                "protein_id": str(row.get("protein_id", "Unknown")),
                "entry_name": str(row.get("entry_name", "Unknown")),
                "organism": str(row.get("organism_id", "Unknown")),
                "function_class": str(row.get("function_class", "Unknown")),
                "similarity_score": round(float(sim_score) * 100, 2)
            })
            
        return results

similarity_engine = SimilarityEngine()

def find_similar_proteins(sequence: str, top_n: int = 5):
    return similarity_engine.search(sequence, top_n)
