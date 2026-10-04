import pandas as pd
import numpy as np
import os
import joblib
import json
from pathlib import Path
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import sys

sys.path.append(os.path.dirname(__file__))
from feature_extraction import ProteinFeaturizer

BASE_DIR = Path(os.path.abspath(__file__)).parent.parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODEL_DIR = BASE_DIR / "models"
REPORTS_DIR = BASE_DIR / "reports"

def main():
    print("Evaluating Best Model on Held-out Test Set...")
    
    test_df = pd.read_csv(PROCESSED_DIR / "split_test.csv")
    if len(test_df) > 1000:
        test_df = test_df.sample(1000, random_state=42)
        
    X_test = test_df['sequence'].values
    y_test_raw = test_df['function_class'].values
    
    le = joblib.load(MODEL_DIR / "label_encoder.joblib")
    y_test = le.transform(y_test_raw)
    
    model = joblib.load(MODEL_DIR / "best_model.joblib")
    
    y_pred = model.predict(X_test)
    
    acc = accuracy_score(y_test, y_pred)
    rep = classification_report(y_test, y_pred, target_names=le.classes_, output_dict=True)
    cm = confusion_matrix(y_test, y_pred)
    
    print(f"Test Accuracy: {acc:.4f}")
    print(f"Test Macro F1: {rep['macro avg']['f1-score']:.4f}")
    
    with open(REPORTS_DIR / "classification_report_best.txt", "w") as f:
        f.write(classification_report(y_test, y_pred, target_names=le.classes_))
        
    with open(REPORTS_DIR / "confusion_matrix.json", "w") as f:
        json.dump({"matrix": cm.tolist(), "classes": le.classes_.tolist()}, f)
        
    with open(MODEL_DIR / "model_meta.json", "r") as f:
        meta = json.load(f)
        
    meta["test_metrics"] = {
        "accuracy": float(acc),
        "macro_f1": float(rep["macro avg"]["f1-score"]),
        "weighted_f1": float(rep["weighted avg"]["f1-score"])
    }
    
    with open(MODEL_DIR / "model_meta.json", "w") as f:
        json.dump(meta, f, indent=4)
        
    print(f"Evaluation complete! Reports saved to {REPORTS_DIR}")

if __name__ == "__main__":
    main()
