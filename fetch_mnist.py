"""
MNIST Data Downloader & Cacher
Downloads the MNIST 784 dataset using fetch_openml and saves it as a 
compressed joblib file for fast reloading in the training pipeline.
"""

import os
import joblib
import time
from sklearn.datasets import fetch_openml

def download_mnist():
    """Download MNIST and cache to disk"""
    data_path = 'models/mnist_data.joblib'
    
    # Ensure models directory exists
    os.makedirs('models', exist_ok=True)
    
    if os.path.exists(data_path):
        print(f"Found cached MNIST data at {data_path}. Loading...")
        return joblib.load(data_path)
    
    print("MNIST data not found. Downloading (this may take 1-3 minutes)...")
    start = time.time()
    
    # Fetch MNIST 784 (v1)
    # Using parser='liac-arff' for better compatibility with older sklearn if needed
    # version=1 is the original 70k sample MNIST
    mnist = fetch_openml('mnist_784', version=1, as_frame=False, parser='liac-arff')
    
    # Cache the full object
    print(f"Download complete! Saving to {data_path}...")
    joblib.dump(mnist, data_path, compress=3)
    
    end = time.time()
    print(f"Success! MNIST data ready in {end-start:.1f}s.")
    return mnist

if __name__ == "__main__":
    download_mnist()
