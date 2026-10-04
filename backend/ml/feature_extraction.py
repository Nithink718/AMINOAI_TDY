import numpy as np
import pandas as pd
from sklearn.base import BaseEstimator, TransformerMixin
from Bio.SeqUtils.ProtParam import ProteinAnalysis
import itertools

VALID_AAS = "ACDEFGHIKLMNPQRSTVWY"

class ProteinFeaturizer(BaseEstimator, TransformerMixin):
    def __init__(self, k=2, use_composition=True, use_physchem=True, use_kmers=True):
        self.k = k
        self.use_composition = use_composition
        self.use_physchem = use_physchem
        self.use_kmers = use_kmers
        self.feature_names_ = []
        
        if self.use_kmers:
            self.kmers = [''.join(p) for p in itertools.product(VALID_AAS, repeat=self.k)]

    def fit(self, X, y=None):
        return self

    def transform(self, X, y=None):
        features_list = []
        
        for seq in X:
            feats = {}
            cleaned_seq = "".join([aa for aa in str(seq).upper() if aa in VALID_AAS])
            if len(cleaned_seq) < max(2, self.k):
                features_list.append(self._get_zero_vector())
                continue
                
            analysis = ProteinAnalysis(cleaned_seq)
            
            if self.use_composition:
                aa_counts = analysis.count_amino_acids()
                total_aa = len(cleaned_seq)
                for aa in VALID_AAS:
                    feats[f"aac_{aa}"] = aa_counts.get(aa, 0) / total_aa
                    
            if self.use_physchem:
                feats["length_log"] = np.log1p(len(cleaned_seq))
                feats["molecular_weight"] = analysis.molecular_weight()
                feats["aromaticity"] = analysis.aromaticity()
                feats["isoelectric_point"] = analysis.isoelectric_point()
                try:
                    feats["instability_index"] = analysis.instability_index()
                except:
                    feats["instability_index"] = 0.0
                feats["gravy"] = analysis.gravy()
                try:
                    feats["charge_at_pH_7"] = analysis.charge_at_pH(7.0)
                except:
                    feats["charge_at_pH_7"] = 0.0
                sec_struct = analysis.secondary_structure_fraction()
                feats["helix_frac"] = sec_struct[0]
                feats["turn_frac"] = sec_struct[1]
                feats["sheet_frac"] = sec_struct[2]
                
            if self.use_kmers:
                kmer_counts = {kmer: 0 for kmer in self.kmers}
                for i in range(len(cleaned_seq) - self.k + 1):
                    kmer = cleaned_seq[i:i+self.k]
                    if kmer in kmer_counts:
                        kmer_counts[kmer] += 1
                total_kmers = len(cleaned_seq) - self.k + 1
                for kmer in self.kmers:
                    feats[f"kmer_{kmer}"] = kmer_counts[kmer] / total_kmers
                    
            features_list.append(feats)
            
            if not self.feature_names_:
                self.feature_names_ = list(feats.keys())
                
        return pd.DataFrame(features_list).values
        
    def _get_zero_vector(self):
        feats = {}
        if self.use_composition:
            for aa in VALID_AAS: feats[f"aac_{aa}"] = 0.0
        if self.use_physchem:
            for k in ["length_log", "molecular_weight", "aromaticity", "isoelectric_point", "instability_index", "gravy", "charge_at_pH_7", "helix_frac", "turn_frac", "sheet_frac"]:
                feats[k] = 0.0
        if self.use_kmers:
            for kmer in self.kmers: feats[f"kmer_{kmer}"] = 0.0
        return feats

    def get_feature_names_out(self, input_features=None):
        return np.array(self.feature_names_)
