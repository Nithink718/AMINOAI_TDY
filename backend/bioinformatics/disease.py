import re

def predict_disease_association(sequence: str):
    seq = sequence.upper().strip()
    
    findings = []
    risk_level = "Low"
    
    # 1. Polyglutamine (PolyQ) Tracts - Huntington's and SCAs
    poly_q = re.search(r'Q{10,}', seq)
    if poly_q:
        q_len = len(poly_q.group())
        if q_len > 35:
            risk_level = "High"
            findings.append({"pathology": "Huntington's / Spinocerebellar Ataxia", "motif": f"{q_len} consecutive Glutamines (PolyQ)", "severity": "High"})
        else:
            if risk_level != "High": risk_level = "Moderate"
            findings.append({"pathology": "PolyQ Expansion", "motif": f"{q_len} consecutive Glutamines", "severity": "Moderate"})
            
    # 2. Amyloidogenic Motifs (GXXXG or similar fibril-forming regions)
    amyloid = re.finditer(r'G.{3}G.{3}G', seq)
    amyloid_count = sum(1 for _ in amyloid)
    if amyloid_count > 1:
        if risk_level != "High": risk_level = "Moderate"
        findings.append({"pathology": "Amyloidosis / Prion-like aggregation", "motif": "Multiple GxxxGxxxG structural motifs", "severity": "Moderate"})
        
    # 3. Alpha-Synuclein like NAC domains (Hydrophobic core)
    # Very simplistic mock check: highly concentrated hydrophobic stretch
    hydrophobic = re.search(r'[VILMFW]{15,}', seq)
    if hydrophobic:
        findings.append({"pathology": "Protein Aggregation Susceptibility", "motif": "Extremely dense hydrophobic core (>15 aa)", "severity": "Moderate"})
        
    # 4. RGD Motif (Integrin binding - related to cancer metastasis if overexpressed)
    if "RGD" in seq:
        findings.append({"pathology": "Potential Oncogenic Matrix Binding", "motif": "RGD (Arg-Gly-Asp) cell attachment sequence", "severity": "Low"})
        
    # 5. LRRK2 / Kinase generic mutation proxy
    if "G2019S" in seq or "I2020T" in seq: # Fake string match just as an example
        pass

    if not findings:
        return {
            "status": "baseline",
            "risk_level": "Low",
            "message": "No known overt pathogenic motifs (PolyQ, Amyloid, etc) detected in primary sequence.",
            "findings": []
        }
        
    return {
        "status": "flagged",
        "risk_level": risk_level,
        "message": f"Detected {len(findings)} structural motifs associated with disease.",
        "findings": findings
    }
