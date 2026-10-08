Write-Host "Starting full data fetching (4000 per class)..."
..\..\venv\Scripts\python.exe fetch_dataset.py

Write-Host "Starting data splitting and preprocessing..."
..\..\venv\Scripts\python.exe split.py

Write-Host "Starting comprehensive model training (RF, GB, MLP)..."
..\..\venv\Scripts\python.exe train.py

Write-Host "Full model training pipeline completed!"
