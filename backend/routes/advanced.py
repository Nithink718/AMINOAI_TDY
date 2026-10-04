from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel
import requests
import os
import sys
from fpdf import FPDF
from datetime import datetime

# Import strict bioinformatics modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'bioinformatics')))
from similarity import find_similar_proteins
from mutation import analyze_mutation
from disease import predict_disease_association

router = APIRouter(prefix="/api/advanced")

class MutationRequest(BaseModel):
    original_sequence: str
    mutated_sequence: str

@router.post("/mutation")
def analyze_mutation_endpoint(req: MutationRequest):
    orig = req.original_sequence.upper().strip()
    mut = req.mutated_sequence.upper().strip()
    
    result = analyze_mutation(orig, mut)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
        
    return result

class SimilarityRequest(BaseModel):
    sequence: str

@router.post("/similarity")
def find_similar(req: SimilarityRequest):
    seq = req.sequence.upper().strip()
    
    results = find_similar_proteins(seq, top_n=5)
    if not results:
        raise HTTPException(status_code=500, detail="Similarity reference dataset not initialized or loaded.")
        
    return {
        "query_length": len(seq),
        "similar_proteins": results
    }

class DiseaseRequest(BaseModel):
    sequence: str

@router.post("/disease_risk")
def check_disease_risk(req: DiseaseRequest):
    return predict_disease_association(req.sequence)

@router.get("/pdb/{pdb_id}")
def proxy_pdb(pdb_id: str):
    url = f"https://files.rcsb.org/download/{pdb_id}.pdb"
    resp = requests.get(url)
    if resp.status_code == 200:
        return PlainTextResponse(resp.text)
    raise HTTPException(status_code=404, detail="Structure not found in RCSB PDB")

class ReportRequest(BaseModel):
    sequence: str
    predicted_class: str
    confidence: float

@router.post("/generate_report")
def generate_report(req: ReportRequest):
    reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'reports'))
    os.makedirs(reports_dir, exist_ok=True)
    
    filename = f"AminoAI_Report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
    filepath = os.path.join(reports_dir, filename)
    
    pdf = FPDF()
    pdf.add_page()
    
    pdf.set_font("Arial", 'B', 24)
    pdf.cell(200, 20, txt="AMINO AI", ln=True, align='C')
    
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="Strict ML Prediction Report", ln=True, align='C')
    pdf.cell(200, 10, txt=f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M')}", ln=True, align='C')
    
    pdf.ln(10)
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 10, txt="1. Machine Learning Prediction", ln=True)
    pdf.set_font("Arial", '', 12)
    pdf.cell(200, 8, txt=f"Predicted Function: {req.predicted_class}", ln=True)
    pdf.cell(200, 8, txt=f"Confidence Score: {req.confidence}%", ln=True)
    
    pdf.ln(10)
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 10, txt="2. Input Sequence", ln=True)
    pdf.set_font("Courier", '', 10)
    
    wrapped_seq = [req.sequence[i:i+60] for i in range(0, len(req.sequence), 60)]
    for line in wrapped_seq:
         pdf.cell(200, 6, txt=line, ln=True)
         
    pdf.ln(10)
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 10, txt="Disclaimer", ln=True)
    pdf.set_font("Arial", 'I', 10)
    pdf.multi_cell(0, 6, txt="AminoAI provides computational predictions based on statistical ML models (Random Forest with K-Mer feature extraction). This is for research and educational purposes only and is not a clinical diagnostic tool.")
    
    pdf.output(filepath)
    return {"message": "Report generated", "file_url": f"/api/advanced/download_report/{filename}"}

@router.get("/download_report/{filename}")
def download_report(filename: str):
    reports_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'reports'))
    filepath = os.path.join(reports_dir, filename)
    if os.path.exists(filepath):
        return FileResponse(filepath, media_type='application/pdf', filename=filename)
    raise HTTPException(status_code=404, detail="File not found")
