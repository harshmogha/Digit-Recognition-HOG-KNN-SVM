"""
Flask API Backend for Digit Pattern Recognition System
Loads trained models and serves predictions via REST API
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_cors import CORS
import numpy as np
import joblib
import json
import os
import base64
from io import BytesIO
from PIL import Image
from skimage.feature import hog
from skimage.measure import label, regionprops

app = Flask(__name__)
CORS(app)

# Load models and preprocessors on startup
print("Loading Precision HOG models...")
knn_model = joblib.load('models/knn_model.joblib')
svm_model = joblib.load('models/svm_model.joblib')
scaler = joblib.load('models/scaler.joblib')
# Note: PCA is no longer needed since we are using HOG features!

# Global Dataset Cache for UI Gallery
mnist_X = None
mnist_y = None

try:
    if os.path.exists('models/mnist_data.joblib'):
        print("Pre-loading MNIST Gallery data...")
        mnist_data_raw = joblib.load('models/mnist_data.joblib')
        # Handle Bunch or Dict
        if hasattr(mnist_data_raw, 'data'):
            mnist_X = mnist_data_raw.data
            mnist_y = mnist_data_raw.target.astype(int)
        else:
            mnist_X = mnist_data_raw['data']
            mnist_y = mnist_data_raw['target'].astype(int)
        print(f"[OK] Gallery Ready - {len(mnist_X)} samples cached.")
except Exception as e:
    print(f"Gallery pre-load failed: {e}")

# Metadata
with open('models/metadata.json', 'r') as f:
    metadata = json.load(f)


print(f"[OK] Precision Vision Active - KNN ({metadata['knn']['accuracy']*100:.1f}%), SVM ({metadata['svm']['accuracy']*100:.1f}%)")


def preprocess_canvas_image(image_data):
    """
    Multi-digit segmentation and HOG preprocessing:
    1. Decode
    2. Threshold and label connected components (segmentation)
    3. For each component:
       a. Crop and pad to square
       b. Resize to 28x28
       c. Extract HOG features
    """
    # Decode base64 image
    image_data = image_data.split(',')[1]
    image_bytes = base64.b64decode(image_data)
    image = Image.open(BytesIO(image_bytes)).convert('L')
    img_array = np.array(image)
    
    # Threshold to find segments (white pixels on black)
    # MNIST is white on black, canvas is also white on black
    mask = img_array > 100
    
    # Label connected components
    label_img = label(mask)
    regions = regionprops(label_img)
    
    if not regions:
        return [], [], [], []

    # Sort regions by min_column (X-coordinate) to read left-to-right
    regions = sorted(regions, key=lambda r: r.bbox[1])
    
    digits_hog = []
    digits_intensity = []
    digits_hog_vis = []
    digits_boxes = []
    
    for props in regions:
        # Ignore extremely small noise
        if props.area < 20:
            continue
            
        minr, minc, maxr, maxc = props.bbox
        digits_boxes.append([int(minc), int(minr), int(maxc), int(maxr)])  # x1, y1, x2, y2 on the canvas
        digit_crop = image.crop((minc, minr, maxc, maxr))
        
        # Pad to square
        w, h = digit_crop.size
        max_dim = max(w, h)
        padding = int(max_dim * 0.15)
        container_size = max_dim + 2 * padding
        container = Image.new('L', (container_size, container_size), 0)
        offset = ((container_size - w) // 2, (container_size - h) // 2)
        container.paste(digit_crop, offset)
        
        # Resize to 28x28
        digit_28x28 = container.resize((28, 28), Image.BILINEAR)
        digit_array = np.array(digit_28x28, dtype=np.float64)
        
        # Peak Normalization
        if digit_array.max() > 0:
            digit_array = (digit_array / digit_array.max()) * 255.0
            
        # Extract HOG features
        hog_features, hog_image = hog(digit_array, 
                                    orientations=9, 
                                    pixels_per_cell=(7, 7), 
                                    cells_per_block=(2, 2), 
                                    visualize=True)
        
        # Scale HOG
        hog_features = hog_features.reshape(1, -1)
        hog_scaled = scaler.transform(hog_features)
        
        # Normalize hog_image for visualization
        if hog_image.max() > 0:
            hog_image = (hog_image / hog_image.max()) * 255.0
            
        digits_hog.append(hog_scaled)
        digits_intensity.append(digit_array)
        digits_hog_vis.append(hog_image)
        
    return digits_hog, digits_intensity, digits_hog_vis, digits_boxes


@app.route('/')
def home():
    """Serve the Minimal UI (default). The Detailed UI is at /old; both pages have a switch button."""
    return render_template('new_ui.html')


@app.route('/old')
def old_ui():
    """Serve the Detailed UI"""
    return render_template('old_ui.html')


@app.route('/new')
def new_ui():
    """Old link kept working: the Minimal UI now lives at /"""
    return redirect(url_for('home'))


@app.route('/predict', methods=['POST'])
def predict():
    """Predict using HOG features and return Visualizations"""
    try:
        data = request.json
        image_data = data.get('image')
        model_type = data.get('model', 'svm')
        
        if not image_data:
            return jsonify({'error': 'No image data provided'}), 400
        
        # Preprocess with Segmentation
        digits_hog, digits_intensity, digits_hog_vis, digits_boxes = preprocess_canvas_image(image_data)
        
        if not digits_hog:
            return jsonify({'error': 'No digits detected'}), 400
            
        # Select model
        model = svm_model if model_type == 'svm' else knn_model
        
        predictions = []
        confidences = []
        
        for hog_feat in digits_hog:
            # Predict
            pred = int(model.predict(hog_feat)[0])
            predictions.append(pred)
            
            # Get probabilities
            if hasattr(model, 'predict_proba'):
                probabilities = model.predict_proba(hog_feat)[0]
                conf = {str(i): float(round(p * 100, 2)) for i, p in enumerate(probabilities)}
            else:
                conf = {str(i): 100.0 if i == pred else 0.0 for i in range(10)}
            confidences.append(conf)
        
        # Concatenate predictions into string
        final_prediction_str = "".join(map(str, predictions))
        
        # For visualization, we'll return the FIRST digit's previews to keep the UI compatible
        # but we also send the full string.
        return jsonify({
            'prediction': final_prediction_str,
            'individual_predictions': predictions,
            'confidence': confidences[0], 
            'confidences': confidences,
            'model': model_type,
            'processed_image': digits_intensity[0].tolist(),
            'hog_visualization': digits_hog_vis[0].tolist(),
            'processed_images': [img.tolist() for img in digits_intensity],
            'hog_visualizations': [img.tolist() for img in digits_hog_vis],
            'boxes': digits_boxes
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/dataset-samples')
def github_dataset_samples():
    """Return 15 random training samples from MNIST from pre-loaded data"""
    try:
        if mnist_X is None:
            return jsonify({'error': 'Dataset not pre-loaded'}), 404
            
        # Pick 15 random indices
        indices = np.random.choice(len(mnist_X), 15, replace=False)
        samples = []
        for idx in indices:
            samples.append({
                'label': int(mnist_y[idx]),
                'image': mnist_X[idx].reshape(28, 28).tolist()
            })
            
        return jsonify({'samples': samples})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/metadata')
def get_metadata():
    """Return training metadata for display in UI"""
    return jsonify(metadata)


@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'models_loaded': True,
        'knn_accuracy': metadata['knn']['accuracy'],
        'svm_accuracy': metadata['svm']['accuracy']
    })


if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("  Digit Recognition Web UI")
    print("  Open: http://localhost:5000")
    print("=" * 50 + "\n")
    app.run(debug=True, port=5000)
