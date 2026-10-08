from Bio.SeqUtils.ProtParam import ProteinAnalysis
import numpy as np

blosum62 = None

def get_residue_group(aa):
    hydrophobic = set("AILMFVW")
    polar = set("STNQ")
    positive = set("RK")
    negative = set("DE")
    aromatic = set("FYWH")
    special = set("CGP")
    
    groups = []
    if aa in hydrophobic: groups.append("Hydrophobic")
    if aa in polar: groups.append("Polar")
    if aa in positive: groups.append("Positive")
    if aa in negative: groups.append("Negative")
    if aa in aromatic: groups.append("Aromatic")
    if aa in special: groups.append("Special")
    return ", ".join(groups)

def extract_physchem(seq):
    analysis = ProteinAnalysis(seq)
    try:
        charge = analysis.charge_at_pH(7.0)
    except:
        charge = 0.0
    return {
        "mw": analysis.molecular_weight(),
        "gravy": analysis.gravy(),
        "charge": charge
    }

def analyze_mutation(original_seq: str, mutated_seq: str):
    orig = original_seq.upper().strip()
    mut = mutated_seq.upper().strip()
    
    if len(orig) != len(mut):
        return {"error": "Sequences must be the same length for direct substitution analysis."}
        
    substitutions = []
    total_blosum_score = 0
    
    for i, (a, b) in enumerate(zip(orig, mut)):
        if a != b:
            score = 0
            if blosum62 is not None and (a, b) in blosum62:
                score = blosum62[(a, b)]
            elif blosum62 is not None and (b, a) in blosum62:
                score = blosum62[(b, a)]
                
            total_blosum_score += score
            
            substitutions.append({
                "position": i + 1,
                "from_aa": a,
                "to_aa": b,
                "from_group": get_residue_group(a),
                "to_group": get_residue_group(b),
                "blosum62_score": float(score)
            })
            
    if not substitutions:
        return {"status": "identical", "message": "No mutations found."}
        
    orig_feats = extract_physchem(orig)
    mut_feats = extract_physchem(mut)
    
    deltas = {
        "delta_mw": round(mut_feats["mw"] - orig_feats["mw"], 2),
        "delta_hydropathy": round(mut_feats["gravy"] - orig_feats["gravy"], 4),
        "delta_charge": round(mut_feats["charge"] - orig_feats["charge"], 4)
    }
    
    # Rule-based impact
    impact = "Low"
    if total_blosum_score < -5 or abs(deltas["delta_charge"]) > 1.0 or abs(deltas["delta_hydropathy"]) > 0.5:
        impact = "High"
    elif total_blosum_score < 0 or abs(deltas["delta_charge"]) > 0.5:
        impact = "Moderate"
        
    return {
        "status": "mutated",
        "mutation_count": len(substitutions),
        "substitutions": substitutions,
        "physicochemical_shifts": deltas,
        "cumulative_blosum_score": float(total_blosum_score),
        "estimated_impact": impact,
        "impact_rationale": "High impact if cumulative BLOSUM62 < -5 or major charge/hydropathy shift."
    }
