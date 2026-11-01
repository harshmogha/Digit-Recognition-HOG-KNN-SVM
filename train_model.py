"""
MNIST Precision Vision Pipeline (HOG + 40k samples)
- Extracts Histogram of Oriented Gradients (HOG) features for structural recognition
- Parameters: 9 orientations, 7x7 pixels per cell, 2x2 cells per block
- Optimized for distinguishing similar digits like 7, 1, and 2.
"""

import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
from skimage.feature import hog
import joblib
import json
import os
import time

# Styling
plt.style.use('dark_background')
ACCENT_COLOR = '#4facfe'
SECONDARY_COLOR = '#00f2fe'

def extract_hog_batch(X_images):
    """Calculate HOG features for a batch of images"""
    hog_list = []
    print(f"Extracting HOG features for {len(X_images)} images...")
    
    # Setup HOG parameters optimized for 28x28
    # 7x7 cells in 28x28 gives 4x4 cells total.
    # orientations=9 is standard for digit recognition balance.
    for img in X_images:
        fd = hog(img.reshape(28, 28), 
                 orientations=9, 
                 pixels_per_cell=(7, 7), 
                 cells_per_block=(2, 2), 
                 visualize=False)
        hog_list.append(fd)
        
    return np.array(hog_list)

def train_hog_models():
    print("\n" + "="*60)
    print("  PHASE 1: DATA LOADING & HOG EXTRACTION (40k samples)")
    print("="*60)
    
    # 1. Load MNIST data
    if not os.path.exists('models/mnist_data.joblib'):
        print("Error: models/mnist_data.joblib not found. Download it first.")
        return

    mnist = joblib.load('models/mnist_data.joblib')
    X_full, y_full = mnist.data, mnist.target.astype(int)
    
    # Increase to 40,000 for better "structural" coverage
    SAMPLE_SIZE = 40000
    print(f"Sampling {SAMPLE_SIZE} samples for Precision Training...")
    indices = np.random.choice(len(X_full), SAMPLE_SIZE, replace=False)
    X, y = X_full[indices], y_full[indices]
    
    # 2. Extract HOG Features
    X_hog = extract_hog_batch(X)
    print(f"Generated HOG feature vectors of size: {X_hog.shape[1]}")
    
    # 3. Split data
    X_train, X_test, y_train, y_test = train_test_split(X_hog, y, test_size=0.2, random_state=42)
    
    # 4. Scaling (StandardScaler is best for HOG features)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    print("\n" + "="*60)
    print("  PHASE 2: MODEL TRAINING (Precision SVM)")
    print("="*60)
    
    # 5. KNN Classifier
    print("Training KNN (k=3)...")
    knn = KNeighborsClassifier(n_neighbors=3, weights='distance')
    knn.fit(X_train_scaled, y_train)
    y_pred_knn = knn.predict(X_test_scaled)
    acc_knn = accuracy_score(y_test, y_pred_knn)
    print(f"KNN Accuracy: {acc_knn:.4f}")
    
    # 6. SVM Classifier (Precision optimized)
    # HOG features work extremely well with SVM RBF kernel
    print("Training SVM (RBF Kernel)...")
    svm = SVC(kernel='rbf', C=10, gamma='scale', probability=True, random_state=42)
    svm.fit(X_train_scaled, y_train)
    y_pred_svm = svm.predict(X_test_scaled)
    acc_svm = accuracy_score(y_test, y_pred_svm)
    print(f"SVM Accuracy: {acc_svm:.4f}")
    
    print("\n" + "="*60)
    print("  PHASE 3: EVALUATION")
    print("="*60)
    
    metrics_knn = classification_report(y_test, y_pred_knn, output_dict=True)
    metrics_svm = classification_report(y_test, y_pred_svm, output_dict=True)
    
    # 7. Save Visualizations
    save_eval_plots(y_test, y_pred_knn, y_pred_svm, acc_knn, acc_svm)
    
    # 8. Save EVERYTHING
    os.makedirs('models', exist_ok=True)
    joblib.dump(knn, 'models/knn_model.joblib')
    joblib.dump(svm, 'models/svm_model.joblib')
    joblib.dump(scaler, 'models/scaler.joblib')
    # We no longer need PCA because HOG is our feature extractor!
    if os.path.exists('models/pca.joblib'):
        os.remove('models/pca.joblib')
        
    metadata = {
        'knn': {
            'accuracy': float(acc_knn),
            'precision': float(metrics_knn['weighted avg']['precision']),
            'recall': float(metrics_knn['weighted avg']['recall']),
            'f1_score': float(metrics_knn['weighted avg']['f1-score'])
        },
        'svm': {
            'accuracy': float(acc_svm),
            'precision': float(metrics_svm['weighted avg']['precision']),
            'recall': float(metrics_svm['weighted avg']['recall']),
            'f1_score': float(metrics_svm['weighted avg']['f1-score'])
        },
        'preprocessing': {
            'feature_mode': 'HOG (Histogram of Oriented Gradients)',
            'hog_params': {
                'orientations': 9,
                'pixels_per_cell': [7, 7],
                'cells_per_block': [2, 2],
                'vector_size': int(X_hog.shape[1])
            },
            'scaling': 'StandardScaler',
            'resolution': '28x28'
        },
        'dataset': {
            'total_samples': int(len(X)),
            'training_samples': int(len(X_train)),
            'test_samples': int(len(X_test))
        }
    }
    
    with open('models/metadata.json', 'w') as f:
        json.dump(metadata, f, indent=4)
        
    print("\n✓ Precision Upgrade Complete! Models saved.")

def save_eval_plots(y_test, y_pred_knn, y_pred_svm, acc_knn, acc_svm):
    os.makedirs('static/images', exist_ok=True)
    
    # Precision Bar Chart
    plt.figure(figsize=(10, 6))
    models = ['KNN', 'SVM']
    accuracies = [acc_knn, acc_svm]
    palette = [ACCENT_COLOR, SECONDARY_COLOR]
    
    bars = plt.bar(models, accuracies, color=palette, alpha=0.9)
    plt.ylim(0, 1.05)
    plt.title('Precision Vision (HOG) Accuracy Comparison', fontsize=14, fontweight='bold')
    for bar in bars:
        yval = bar.get_height()
        plt.text(bar.get_x() + bar.get_width()/2, yval + 0.01, f'{yval:.1%}', ha='center', fontweight='bold')
    plt.savefig('static/images/accuracy_comparison.png')
    
    # Confusion Matrix
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
    sns.heatmap(confusion_matrix(y_test, y_pred_knn), annot=True, fmt='d', cmap='Oranges', ax=ax1)
    ax1.set_title(f"KNN Confusion (Acc: {acc_knn:.2%})")
    sns.heatmap(confusion_matrix(y_test, y_pred_svm), annot=True, fmt='d', cmap='Greens', ax=ax2)
    ax2.set_title(f"SVM Confusion (Acc: {acc_svm:.2%})")
    plt.tight_layout()
    plt.savefig('static/images/confusion_matrices.png')
    plt.close()

if __name__ == "__main__":
    train_hog_models()
