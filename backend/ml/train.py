import pandas as pd
import numpy as np
import os
import joblib
import json
from pathlib import Path
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import StratifiedKFold, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neural_network import MLPClassifier
import time

# Required to load the transformer
import sys
sys.path.append(os.path.dirname(__file__))
from feature_extraction import ProteinFeaturizer

BASE_DIR = Path(os.path.abspath(__file__)).parent.parent.parent
PROCESSED_DIR = BASE_DIR / "data" / "processed"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)
REPORTS_DIR = BASE_DIR / "reports"
REPORTS_DIR.mkdir(parents=True, exist_ok=True)

def main():
    print("Loading training data...")
    train_df = pd.read_csv(PROCESSED_DIR / "split_train.csv")
    
    # NO SAMPLING LIMIT: Training on the full 15,000+ dataset for maximum accuracy
    print(f"Total sequences for training: {len(train_df)}")
    
    X_train = train_df['sequence'].values
    y_train_raw = train_df['function_class'].values
    
    le = LabelEncoder()
    y_train = le.fit_transform(y_train_raw)
    
    joblib.dump(le, MODEL_DIR / "label_encoder.joblib")
    
    models_to_test = {
        "RandomForest": {
            "clf": RandomForestClassifier(random_state=42, class_weight="balanced_subsample", n_jobs=-1),
            "params": {
                "clf__n_estimators": [200],
                "clf__max_depth": [40],
                "clf__min_samples_leaf": [1]
            }
        },
        "GradientBoosting": {
            "clf": GradientBoostingClassifier(random_state=42),
            "params": {
                "clf__n_estimators": [100],
                "clf__learning_rate": [0.1],
                "clf__max_depth": [3]
            }
        },
        "MLP_NeuralNet": {
            "clf": MLPClassifier(random_state=42, early_stopping=True),
            "params": {
                "clf__hidden_layer_sizes": [(100,)],
                "clf__alpha": [0.001],
                "clf__learning_rate_init": [0.01]
            }
        }
    }
    
    cv = StratifiedKFold(n_splits=3, shuffle=True, random_state=42)
    
    best_overall_score = 0
    best_overall_model = None
    best_model_name = ""
    
    metrics = {}
    
    for name, config in models_to_test.items():
        print(f"Training {name} pipeline...")
        start_time = time.time()
        
        pipeline = Pipeline([
            ("features", ProteinFeaturizer(k=2, use_composition=True, use_physchem=True, use_kmers=True)),
            ("scaler", StandardScaler()),
            ("clf", config["clf"])
        ])
        
        search = GridSearchCV(pipeline, config["params"], cv=cv, scoring='f1_macro', n_jobs=1)
        search.fit(X_train, y_train)
        
        train_time = time.time() - start_time
        
        score = search.best_score_
        print(f"  -> Best Macro F1: {score:.4f} (Time: {train_time:.1f}s)")
        
        metrics[name] = {
            "cv_macro_f1": float(score),
            "best_params": {k: str(v) for k, v in search.best_params_.items()},
            "train_time_seconds": float(train_time)
        }
        
        joblib.dump(search.best_estimator_, MODEL_DIR / f"{name}_model.joblib")
        
        if score > best_overall_score:
            best_overall_score = score
            best_overall_model = search.best_estimator_
            best_model_name = name
            
    print(f"\nBest Model Overall: {best_model_name} (F1: {best_overall_score:.4f})")
    
    joblib.dump(best_overall_model, MODEL_DIR / "best_model.joblib")
    
    meta = {
        "best_model": best_model_name,
        "metrics": metrics,
        "classes": le.classes_.tolist()
    }
    with open(MODEL_DIR / "model_meta.json", "w") as f:
        json.dump(meta, f, indent=4)
        
    print("Training phase complete. Models saved.")

if __name__ == "__main__":
    main()
