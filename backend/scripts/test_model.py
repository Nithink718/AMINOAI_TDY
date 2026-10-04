import os
import sys
from pathlib import Path

# Add ML folder to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'ml')))
from predict import predict_sequence

# Verified test sequences from UniProt
TEST_CASES = {
    "Human Lysozyme (Enzyme/Defense)": "MKALIVLGLVLLSVTVQGKVFERCELARTLKRLGMDGYRGISLANWMCLAKWESGYNTRATNYNAGDRSTDYGIFQINSRYWCNDGKTPGAVNACHLSCSALLQDNIADAVACAKRVVRDPQGIRAWVAWRNRCQNRDVRQYVQGCGV",
    "Human Hemoglobin Alpha (Transport)": "MVLSPADKTNVKAAWGKVGAHAGEYGAEALERMFLSFPTTKTYFPHFDLSHGSAQVKGHGKKVADALTNAVAHVDDMPNALSALSDLHAHKLRVDPVNFKLLSHCLLVTLAAHLPAEFTPAVHASLDKFLASVSTVLTSKYR",
    "Human Collagen alpha-1 (Structural)": "MFSFVDLRLLLLLAATALLTHGQEEGQVEGQDEDIPPITCVQNGLRYHDRDVWKPEPCRICVCDNGKVLCDDVICDETKNCPGAEVPEGECCPVCPDGSESPTDQETTGVEGPKGDTGPRGPRGPAGPPGRDGIPGQPGLPGPPGPPGPPGPPGLGGNFAPQLSYGYDEKSTGGISVPGPMGPSGPRGLPGPPGAPGPQGFQGNPGEPGEPGVSGPMGPRGPPGPPGK",
    "Human p53 Tumor Suppressor (Regulatory)": "MEEPQSDPSVEPPLSQETFSDLWKLLPENNVLSPLPSQAMDDLMLSPDDIEQWFTEDPGPDEAPRMPEAAPPVAPAPAAPTPAAPAPAPSWPLSSSVPSQKTYQGSYGFRLGFLHSGTAKSVTCTYSPALNKMFCQLAKTCPVQLWVDSTPPPGTRVRAMAIYKQSQHMTEVVRRCPHHERCSDSDGLAPPQHLIRVEGNLRVEYLDDRNTFRHSVVVPYEPPEVGSDCTTIHYNYMCNSSCMGGMNRRPILTIITLEDSSGNLLGRNSFEVRVCACPGRDRRTEEENLRKKGEPHHELPPGSTKRALPNNTSSSPQPKKKPLDGEYFTLQIRGRERFEMFRELNEALELKDAQAGKEPGGSRAHSSHLKSKKGQSTSRHKKLMFKTEGPDSD"
}

def run_tests():
    print("=" * 60)
    print(" RUNNING DEEP MODEL EVALUATION ")
    print("=" * 60)
    for name, seq in TEST_CASES.items():
        print(f"\n[Test] {name}")
        try:
            result = predict_sequence(seq)
            print(f"  Predicted Class : {result['predicted_class'].upper()}")
            print(f"  Confidence      : {result['confidence']}%")
            print(f"  Top Probabilities:")
            for k, v in list(result['probabilities'].items())[:3]:
                print(f"    - {k}: {v}%")
            print(f"  Physics Metrics : MW={result['feature_summary'].get('molecular_weight', 0)} Da, pI={result['feature_summary'].get('isoelectric_point', 0)}")
        except Exception as e:
            print(f"  Error: {e}")
            
if __name__ == "__main__":
    run_tests()
