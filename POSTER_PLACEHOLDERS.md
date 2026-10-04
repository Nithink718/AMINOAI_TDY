# Poster Placeholder Details for AminoAI

Based on the project's model evaluation reports and metrics, here are the exact details to fill in the placeholders on your presentation poster.

## 09 MODEL EVALUATION - BEST MODEL
- **Accuracy**: 80% (0.80)
- **Precision**: 82% (0.82 macro average)
- **Recall**: 80% (0.80 macro average)
- **F1-Score**: 80% (0.80 macro average)
- **BEST MODEL**: Random Forest (averaged using macro average)

## 10 KEY FINDINGS
1. **Best Model Performance**: The Random Forest classifier outperformed baseline models, achieving an overall accuracy of 80% and a balanced macro F1-score of 0.80 across all 5 classes.
2. **Feature Contributions**: The concatenation of K-mer frequency vectors and physicochemical sequence properties (like molecular weight and isoelectric point) provided a robust numerical representation for the ML models, significantly boosting predictive power over simple amino acid composition (AAC) alone.
3. **Class Performance (Easy vs. Hard)**: 
   - **Easiest**: Structural and Defense proteins were the easiest to classify, with precision scores of 96% and 88%, respectively.
   - **Frequently Confused**: Transport proteins were the most difficult to classify (lowest recall at 64%), frequently being misclassified as Enzymes (36 times) or Regulatory proteins (23 times).
4. **Observed Limitations**: The model struggles slightly with overlapping feature spaces for transport proteins, suggesting that primary sequence features alone might not fully capture the complex structural binding domains required for transport functions.

## 12 RESULTS & VISUAL EVIDENCE
**Best Model (Random Forest) Metrics for Bar Chart (Acc-P-R-F1):**
- Accuracy: 80%
- Precision: 82%
- Recall: 80%
- F1-score: 80%

**Confusion Matrix Values (To fill the TP diagonal and key off-diagonal boxes):**
*Classes Order: Defense, Enzyme, Regulatory, Structural, Transport*
- **Defense (True)**: 161 (TP), 2 (Enz), 22 (Reg), 2 (Str), 2 (Trn)
- **Enzyme (True)**: 1 (Def), 167 (TP), 19 (Reg), 2 (Str), 3 (Trn)
- **Regulatory (True)**: 8 (Def), 30 (Enz), 175 (TP), 1 (Str), 2 (Trn)
- **Structural (True)**: 2 (Def), 11 (Enz), 16 (Reg), 165 (TP), 7 (Trn)
- **Transport (True)**: 11 (Def), 36 (Enz), 23 (Reg), 2 (Str), 130 (TP)
*(Note: The TP values go straight down the middle diagonal).*

## 13 CONCLUSION
AminoAI is a protein analysis platform that addresses multi-class protein function classification. Amino-acid sequences are preprocessed and converted into numerical biological features, which are used to train and compare Machine Learning classifiers. The best model achieved **80% Accuracy and a 0.80 Macro F1-Score**, showing that sequence-derived features can support computational function prediction.

## 15 REFERENCES
*(Copy these exactly into the references section)*
1. Pedregosa, F., et al. (2011). Scikit-learn: Machine Learning in Python. *Journal of Machine Learning Research*, 12, 2825-2830. URL: https://jmlr.csail.mit.edu/papers/v12/pedregosa11a.html
2. Cock, P. J., et al. (2009). Biopython: freely available Python tools for computational molecular biology and bioinformatics. *Bioinformatics*, 25(11), 1422-1423.
3. The UniProt Consortium (2023). UniProt: the universal protein knowledgebase in 2023. *Nucleic Acids Research*, 51(D1), D523–D531.
4. McKinney, W. (2010). Data Structures for Statistical Computing in Python. *Proceedings of the 9th Python in Science Conference*, 51-56.
