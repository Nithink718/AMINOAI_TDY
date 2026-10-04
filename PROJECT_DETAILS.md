# AminoAI Project Details

AminoAI is a bioinformatics web application designed to predict protein functions and analyze amino acid sequences using machine learning. The project utilizes a modern tech stack consisting of a React + TypeScript frontend and a FastAPI (Python) backend.

## Project Structure

The repository (`c:/Users/Sivapriya/Desktop/AminoAIF`) is organized into several key directories:
- `backend/`: Contains the FastAPI application, machine learning prediction models, and bioinformatics analysis logic.
- `frontend/`: Contains the React + TypeScript single-page application built with Vite and Tailwind CSS.
- `models/`: Stores pre-trained machine learning models and artifacts (e.g., joblib and json files).
- `data/`: Likely used for datasets, raw files, or preprocessing output.
- `notebooks/`: Jupyter notebooks used for data exploration and model training.
- `reports/`: Automatically generated PDF reports for protein predictions.

## Backend (FastAPI + Python)

The backend exposes a REST API compliant with strict ML prediction and advanced bioinformatics analysis.

### Core Modules
- **`main.py`**: The entry point for the FastAPI server. It exposes the basic `/` route and `/api/predict` route, which handles protein sequence predictions utilizing a pre-trained ML model.
- **`ml/predict.py`**: Loads trained machine learning artifacts (`best_model.joblib`, `label_encoder.joblib`) from the `models/` directory and exposes the `ProteinPredictor` class. It predicts protein classes and provides prediction confidence and feature summaries (e.g., molecular weight, length, isoelectric point).
- **`routes/advanced.py`**: Contains advanced bioinformatics API endpoints:
  - `/api/advanced/mutation`: Analyzes mutations between two sequences.
  - `/api/advanced/similarity`: Finds similar proteins in a reference dataset.
  - `/api/advanced/disease_risk`: Checks protein sequences for disease risk motifs.
  - `/api/advanced/pdb/{pdb_id}`: Proxies requests to RCSB PDB for protein structure files.
  - `/api/advanced/generate_report`: Generates downloadable PDF reports containing ML predictions and confidence scores using `fpdf`.
- **`bioinformatics/disease.py`**: Contains rules and regex-based motif scanning to predict disease associations based on protein sequences (e.g., Polyglutamine tracts for Huntington's, Amyloidogenic motifs).
- **`bioinformatics/mutation.py` & `bioinformatics/similarity.py`**: Modules handling specific bioinformatics tasks.

### Backend Dependencies
Key libraries used include:
- `fastapi`, `pydantic`, `uvicorn`: For API routing and data validation.
- `scikit-learn`, `joblib`, `numpy`, `pandas`: For machine learning prediction pipelines.
- `fpdf`: For generating prediction reports.
- `requests`: For external API calls.

## Frontend (React + TypeScript + Vite)

The frontend is a fast and responsive web UI for interacting with the AminoAI backend.

### Tech Stack
- **Framework & Build Tool**: React 19, Vite
- **Language**: TypeScript
- **Styling**: Tailwind CSS, PostCSS, Autoprefixer, `clsx`, `tailwind-merge`
- **UI & Visualization**: `lucide-react` (icons), `recharts` (charts/graphs)
- **Networking**: `axios` (for API requests)
- **Linting**: Oxlint

### Features
The frontend interfaces with the backend to allow users to input protein sequences, submit them for processing, and visualize the prediction results, sequence similarities, mutation analysis, disease risks, and structural insights.

## System Features & Capabilities
1. **Protein Function Prediction**: Accepts an amino acid sequence and predicts its functional class using an ML model (e.g., Random Forest with K-Mer feature extraction).
2. **Confidence & Feature Extraction**: Returns the prediction confidence alongside key physical properties (extracted from sklearn pipeline transformers).
3. **Mutation Analysis**: Analyzes differences and potential impacts between an original sequence and a mutated sequence.
4. **Disease Risk Profiling**: Detects pathogenic structural motifs in the input sequence, categorizing risks as Low, Moderate, or High.
5. **PDF Report Generation**: Users can generate and download comprehensive PDF reports of the ML predictions and sequence analysis.
