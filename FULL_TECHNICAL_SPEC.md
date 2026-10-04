# AminoAI: Full Technical Specification & Architecture

This document provides a complete, comprehensive technical breakdown of the AminoAI project, covering every layer of the stack.

---

### 1. The Core Application Concept
**AminoAI** is an AI-powered protein analysis and bioinformatics intelligence platform. It is designed to take raw amino acid sequences (e.g., `MKTLLIL...`) and automatically predict their functional biological class (e.g., Enzyme, Transport, Structural) using Machine Learning, while also offering advanced bioinformatics tools like mutation analysis and disease association.

### 2. The Artificial Intelligence & Machine Learning (AI/ML)
The AI is a classical machine learning pipeline built natively with `scikit-learn` and `Biopython`.
* **Dataset**: Trained on over 15,000 protein sequences sourced from highly curated databases like UniProtKB/Swiss-Prot.
* **Feature Extraction**: Machine learning models cannot process raw text strings directly. The backend uses a custom `ProteinFeaturizer` class to convert a sequence into a numerical vector. It extracts 3 key types of features:
  1. **Amino Acid Composition (AAC)**: The frequency of the 20 standard amino acids in the sequence.
  2. **Physicochemical Properties**: Extracting biological traits mathematically (e.g., molecular weight, aromaticity, isoelectric point (pI), instability index, GRAVY/hydrophobicity, and secondary structure fractions).
  3. **K-mer Frequencies**: Sliding window counts of pairs of amino acids (k=2).
* **The Model**: A **Random Forest Classifier** (an ensemble of decision trees) is the best-performing model. It takes the scaled numerical features and classifies the protein into one of 5 functional classes:
  1. `Enzyme`
  2. `Transport`
  3. `Structural`
  4. `Regulatory`
  5. `Defense`
* **Performance**: The Random Forest model achieved an **80% Accuracy** and **0.80 Macro F1-Score** on unseen test data.

### 3. The Backend (Python + FastAPI)
The backend acts as the computational engine of the application, exposing a REST API that the frontend communicates with.
* **Framework**: Built with **FastAPI** for high performance, asynchronous request handling, and automatic OpenAPI documentation.
* **Endpoints & Architecture**:
  * `/api/predict`: Takes a raw sequence, runs it through the saved Random Forest model (`best_model.joblib`), and returns the predicted class, confidence percentage, full class probabilities, and extracted physicochemical statistics.
  * `/api/advanced/mutation`: Compares an original sequence against a mutated sequence and calculates the substitution impact (change in charge, hydropathy, etc.).
  * `/api/advanced/similarity`: Uses sequence alignment or k-mer cosine similarity to find related proteins in a reference dataset.
  * `/api/advanced/disease_risk`: Scans the sequence using Regex logic to find known pathogenic structural motifs (e.g., Polyglutamine (PolyQ) tracts for Huntington's disease, or Amyloidogenic motifs).
  * `/api/advanced/generate_report`: Uses the `fpdf` library to generate a dynamically formatted, downloadable PDF report of the prediction and protein statistics.
* **Core Dependencies**: `scikit-learn`, `pandas`, `numpy`, `biopython`, `fpdf`, `pydantic`.

### 4. The Database Layer
* **No Relational Database**: The system is designed to be highly stateless and computationally driven. It does **not** use a traditional SQL database (like PostgreSQL or MySQL) or a NoSQL database (like MongoDB).
* **Disk-based Storage**: 
  * The raw and processed datasets (CSV/FASTA files) live directly in the `data/` directory.
  * The trained AI models, label encoders, and metric metadata are serialized and stored as flat files (`.joblib` and `.json`) in the `models/` directory.
  * Generated PDF files are saved directly to a `reports/` directory on the server's local filesystem.

### 5. The Frontend (React + TypeScript + Vite)
The frontend is a premium, modern Single Page Application (SPA) designed to feel like an enterprise scientific tool (resembling sleek platforms like Vercel or Stripe).
* **Framework**: Built with **React 18** and **Vite** for incredibly fast hot-module replacement and optimized compilation. It is strongly typed using **TypeScript** to prevent runtime errors.
* **Styling & UI**: Built entirely with **Tailwind CSS**. The design language is "White Minimalist + Purple". It avoids dark mode and heavy gradients, relying on pristine white/gray surfaces with sharp purple accents for buttons, focus rings, and key data points. 
* **Data Visualization**: Uses **Recharts** to render interactive, responsive data graphics like Probability Bar Charts, Function Distribution Donut Charts, and Model Performance grids.
* **Icons & Components**: Utilizes **Lucide React** for crisp vector iconography. The UI is component-driven, utilizing custom, reusable `Card`, `Button`, `StepProgress`, and `SequenceViewer` primitives.
* **UX/State**: Handles complex user flows such as dragging and dropping `.fasta` files for batch processing, displaying step-by-step loading animations during ML predictions, and routing smoothly between a Dashboard overview, deep-dive Prediction Results, and various advanced Tool interfaces.
