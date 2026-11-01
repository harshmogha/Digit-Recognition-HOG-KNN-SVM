/* =================================================================
   Digit Recognizer - Main Application Logic
   ================================================================= */

// State
let currentModel = 'svm';
let isDrawing = false;
let hasDrawn = false;
let lastX = 0;
let lastY = 0;
let lastPredictionData = null; // Store results for multi-digit selector

/**
 * Confidence colour scale: low = red, middle = yellow, high = green.
 *   <= 40 %   -> red
 *   40 - 70 % -> red to yellow
 *   70 - 95 % -> yellow to green
 *   >= 95 %   -> green
 * Used for the 10 class bars and for the per-digit tiles when several
 * digits are recognised, so a weak digit is red and a sure digit is green.
 */
function confColor(pct) {
    const p = Math.max(0, Math.min(100, Number(pct) || 0));
    let hue;
    if (p <= 40) hue = 0;
    else if (p <= 70) hue = ((p - 40) / 30) * 60;
    else if (p <= 95) hue = 60 + ((p - 70) / 25) * 60;
    else hue = 120;
    // a little lighter around yellow so it stays visibly yellow, not olive
    const light = 40 + 8 * (1 - Math.abs(hue - 60) / 60);
    return `hsl(${hue.toFixed(0)}, 90%, ${light.toFixed(0)}%)`;
}

// Canvas setup
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('canvasOverlay');

// Initialize canvas
function initCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 28;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.imageSmoothingEnabled = true;
}


initCanvas();

// Drawing events - Mouse
canvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    hasDrawn = true;
    overlay.classList.add('hidden');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    lastX = (e.clientX - rect.left) * scaleX;
    lastY = (e.clientY - rect.top) * scaleY;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    lastX = x;
    lastY = y;
});

canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mouseleave', () => { isDrawing = false; });

// Touch events for mobile
canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    hasDrawn = true;
    overlay.classList.add('hidden');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    lastX = (touch.clientX - rect.left) * scaleX;
    lastY = (touch.clientY - rect.top) * scaleY;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    lastX = x;
    lastY = y;
});

canvas.addEventListener('touchend', () => { isDrawing = false; });

// Model selection
function selectModel(model) {
    currentModel = model;
    const btnKNN = document.getElementById('btnKNN');
    const btnSVM = document.getElementById('btnSVM');
    const btnPredict = document.getElementById('btnPredict');
    const indicator = document.getElementById('activeModelBadge');
    const slider = document.getElementById('modelSlider');
    if (slider) slider.classList.toggle('knn', model === 'knn');
    
    if (model === 'knn') {
        btnKNN.classList.add('active');
        btnSVM.classList.remove('active');
        btnPredict.classList.remove('svm-active');
        if (indicator) {
            indicator.textContent = 'KNN';
            indicator.classList.add('knn');
        }
    } else {
        btnSVM.classList.add('active');
        btnKNN.classList.remove('active');
        btnPredict.classList.add('svm-active');
        if (indicator) {
            indicator.textContent = 'SVM';
            indicator.classList.remove('knn');
        }
    }
    
    // Auto-predict if something is drawn
    if (hasDrawn) {
        predict();
    }
}

// Clear canvas
function clearCanvas() {
    initCanvas();
    hasDrawn = false;
    overlay.classList.remove('hidden');
    
    // Reset prediction display
    const pResult = document.getElementById('predictionResult');
    if (pResult) {
        pResult.textContent = '?';
        pResult.classList.remove('predicted');
    }
    
    const pStatus = document.getElementById('predictionStatus');
    if (pStatus) {
        pStatus.textContent = 'Draw a digit to see prediction';
    }
    
    // Reset confidence bars
    resetConfidenceBars();
    
    // Clear processed maps
    const intContainer = document.getElementById('intensityMaps');
    const hogContainer = document.getElementById('hogMaps');
    if (intContainer) intContainer.innerHTML = '';
    if (hogContainer) hogContainer.innerHTML = '';
    
    // Clear digit selector and overview
    const selector = document.getElementById('digitSelector');
    if (selector) selector.innerHTML = '';
    const overview = document.getElementById('analysisOverview');
    if (overview) overview.innerHTML = '';
    const insights = document.getElementById('patternInsights');
    if (insights) insights.style.display = 'none';
    lastPredictionData = null;
}

// Reset confidence bars
function resetConfidenceBars() {
    for (let i = 0; i < 10; i++) {
        const fill = document.getElementById(`confFill${i}`);
        const val = document.getElementById(`confVal${i}`);
        const digit = document.getElementById(`confDigit${i}`);
        if (fill) {
            fill.style.width = '0%';
            fill.style.background = '';
            fill.classList.remove('top');
            fill.classList.remove('svm');
        }
        if (val) {
            val.textContent = '0.00%';
            val.classList.remove('highlight');
        }
        if (digit) {
            digit.classList.remove('highlight');
        }
    }
}

// Predict
async function predict() {
    if (!hasDrawn) return;
    
    const btnPredict = document.getElementById('btnPredict');
    if (btnPredict) {
        btnPredict.disabled = true;
        btnPredict.innerHTML = '<span class="loading" style="width:18px;height:18px;border-radius:50%;display:inline-block;"></span> Analyzing...';
    }
    
    // Luxury: Activate scanner sweep
    document.querySelectorAll('.preview-wrapper').forEach(w => w.classList.add('scanning'));
    
    try {
        await new Promise(r => setTimeout(r, 600)); // Artificial delay for aesthetic
        const imageData = canvas.toDataURL('image/png');
        
        const response = await fetch('/predict', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: imageData, model: currentModel })
        });
        
        const result = await response.json();
        
        if (result.error) {
            const status = document.getElementById('predictionStatus');
            if (status) status.textContent = `Error: ${result.error}`;
            return;
        }
        
        // Update Result Digit
        const resDigit = document.getElementById('predictionResult');
        if (resDigit) {
            resDigit.textContent = result.prediction;
            
            // Adjust font size for multi-digit results
            const length = String(result.prediction).length;
            if (length > 4) {
                resDigit.style.fontSize = '3rem';
            } else if (length > 2) {
                resDigit.style.fontSize = '4.5rem';
            } else if (length > 1) {
                resDigit.style.fontSize = '6rem';
            } else {
                resDigit.style.fontSize = '7.5rem';
            }
            
            resDigit.classList.remove('predicted');
            void resDigit.offsetWidth; 
            resDigit.classList.add('predicted');
        }
        
        // Update Status Label
        const status = document.getElementById('predictionStatus');
        if (status) {
            const predStr = String(result.prediction);
            if (predStr.length > 1) {
                status.innerHTML = `<span style="color:var(--cyan)">Multi-digit detected:</span> <strong>${predStr}</strong>. <br><small style="color:var(--text-dim)">(Previews show first digit)</small>`;
            } else {
                const topConf = result.confidence[String(result.prediction)];
                status.textContent = `Predicted: ${result.prediction} with ${topConf?.toFixed(1) || '100'}% confidence`;
            }
        }
        
        // Update Previews (Multi-digit Tiled Display)
        if (result.processed_images) renderMultiMaps('intensityMaps', result.processed_images);
        if (result.hog_visualizations) renderMultiMaps('hogMaps', result.hog_visualizations, true);
        
        // Store results for the selector
        lastPredictionData = result;
        
        // Build Technical Overview Tiles
        const overview = document.getElementById('analysisOverview');
        if (overview) {
            overview.innerHTML = '';
            if (result.individual_predictions && result.individual_predictions.length > 1) {
                result.individual_predictions.forEach((digit, idx) => {
                    const topConf = result.confidences[idx][String(digit)];
                    
                    const tile = document.createElement('div');
                    tile.className = 'analysis-tile';
                    tile.id = `analysisTile${idx}`;
                    tile.onclick = () => updateTechnicalAnalysis(idx);
                    
                    tile.innerHTML = `
                        <span class="tile-digit">${digit}</span>
                        <span class="tile-conf">${topConf.toFixed(1)}%</span>
                        <div class="tile-bar-bg">
                            <div class="tile-bar-fill" style="width: ${topConf}%; background: ${confColor(topConf)}"></div>
                        </div>
                    `;
                    overview.appendChild(tile);
                });
            }
        }
        
        // Hide the old selector pills as we now have the overview tiles
        const selector = document.getElementById('digitSelector');
        if (selector) selector.style.display = 'none';
        
        // Initial sync to first digit
        updateTechnicalAnalysis(0);
        
    } catch (err) {
        const status = document.getElementById('predictionStatus');
        if (status) status.textContent = `Connection error - is the server running?`;
        console.error('Prediction error:', err);
    } finally {
        if (btnPredict) {
            btnPredict.disabled = false;
            const icon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>';
            btnPredict.innerHTML = `${icon} Predict`;
        }
        document.querySelectorAll('.preview-wrapper').forEach(w => w.classList.remove('scanning'));
    }
}

// Flatten pixels for standard 1D Uint8ClampedArray
function flattenPixels(pixels2D) {
    return pixels2D.flat();
}

/**
 * Render multiple map tiles to a container
 */
function renderMultiMaps(containerId, imagesList, isHog = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = ''; // Clear old maps
    
    imagesList.forEach((pixels2D, idx) => {
        const tile = document.createElement('div');
        tile.className = 'map-tile';
        
        const canvas = document.createElement('canvas');
        canvas.width = 28;
        canvas.height = 28;
        tile.appendChild(canvas);
        
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(28, 28);
        const flattened = pixels2D.flat();
        
        for (let i = 0; i < flattened.length; i++) {
            const val = flattened[i];
            if (isHog) {
                // Render HOG in accent blue
                imgData.data[i * 4] = 79 * (val/255);     // R
                imgData.data[i * 4 + 1] = 172 * (val/255); // G
                imgData.data[i * 4 + 2] = 254 * (val/255); // B
                imgData.data[i * 4 + 3] = 255;             // A
            } else {
                imgData.data[i * 4] = val;     // R
                imgData.data[i * 4 + 1] = val; // G
                imgData.data[i * 4 + 2] = val; // B
                imgData.data[i * 4 + 3] = 255; // A
            }
        }
        ctx.putImageData(imgData, 0, 0);
        container.appendChild(tile);
    });
}


// Update confidence bars
function updateConfidenceBars(confidence, prediction) {
    const isSvm = currentModel === 'svm';
    
    for (let i = 0; i < 10; i++) {
        const value = confidence[String(i)] || 0;
        const fill = document.getElementById(`confFill${i}`);
        const val = document.getElementById(`confVal${i}`);
        const digit = document.getElementById(`confDigit${i}`);
        
        if (fill) {
            fill.style.width = `${value}%`;
            fill.style.background = confColor(value); // red (low) -> yellow -> green (high)
            fill.classList.toggle('svm', isSvm);
            fill.classList.toggle('top', i === prediction);
        }
        if (val) {
            val.textContent = `${value.toFixed(2)}%`;
            val.classList.toggle('highlight', i === prediction);
        }
        if (digit) {
            digit.classList.toggle('highlight', i === prediction);
        }
    }
}

// Render the 28x28 processed image
function renderProcessedImage(imageData) {
    const pCanvas = document.getElementById('processedCanvas');
    if (!pCanvas) return;
    const pCtx = pCanvas.getContext('2d');
    const size = 28;
    const scale = pCanvas.width / size;
    
    pCtx.clearRect(0, 0, pCanvas.width, pCanvas.height);
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const val = imageData[y][x];
            pCtx.fillStyle = `rgb(${val}, ${val}, ${val})`;
            pCtx.fillRect(x * scale, y * scale, scale, scale);
        }
    }
}

// Render the 28x28 HOG visualization
function renderHogImage(hogData) {
    const hCanvas = document.getElementById('hogCanvas');
    if (!hCanvas) return;
    const hCtx = hCanvas.getContext('2d');
    const size = 28;
    const scale = hCanvas.width / size;
    
    hCtx.clearRect(0, 0, hCanvas.width, hCanvas.height);
    
    for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
            const val = hogData[y][x];
            // Render HOG in accent blue for "cool" factor
            hCtx.fillStyle = `rgba(79, 172, 254, ${val / 255})`;
            hCtx.fillRect(x * scale, y * scale, scale, scale);
        }
    }
}

// Fetch and display dataset samples for the Gallery
async function loadDatasetGallery() {
    const gallery = document.getElementById('datasetGallery');
    if (!gallery) return;
    
    try {
        const response = await fetch('/dataset-samples');
        const data = await response.json();
        
        if (data.samples) {
            gallery.innerHTML = '';
            data.samples.forEach(sample => {
                const item = document.createElement('div');
                item.className = 'gallery-item';
                
                const canvas = document.createElement('canvas');
                canvas.width = 28;
                canvas.height = 28;
                const ctx = canvas.getContext('2d');
                
                // Render sample
                const imgData = sample.image;
                const pixels = ctx.createImageData(28, 28);
                for (let i = 0; i < 28; i++) {
                    for (let j = 0; j < 28; j++) {
                        const idx = (i * 28 + j) * 4;
                        const val = imgData[i][j];
                        pixels.data[idx] = val;     // R
                        pixels.data[idx+1] = val;   // G
                        pixels.data[idx+2] = val;   // B
                        pixels.data[idx+3] = 255;   // A
                    }
                }
                ctx.putImageData(pixels, 0, 0);
                
                const label = document.createElement('span');
                label.className = 'label-pill';
                label.innerText = sample.label;
                
                item.appendChild(canvas);
                item.appendChild(label);
                gallery.appendChild(item);
            });
        }
    } catch (error) {
        console.error("Gallery failed to load:", error);
        gallery.innerHTML = '<p class="error">Knowledge base unreachable.</p>';
    }
}

// Clear all visualizations
function clearPreviews() {
    ['processedCanvas', 'hogCanvas'].forEach(id => {
        const c = document.getElementById(id);
        if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
    });
}

// Initialize confidence bars HTML
function initConfidenceBars() {
    const container = document.getElementById('confidenceBars');
    let html = '';
    for (let i = 0; i < 10; i++) {
        html += `
            <div class="conf-row">
                <span class="conf-digit" id="confDigit${i}">${i}</span>
                <div class="conf-bar-bg">
                    <div class="conf-bar-fill" id="confFill${i}"></div>
                </div>
                <span class="conf-value" id="confVal${i}">0.00%</span>
            </div>`;
    }
    container.innerHTML = html;
}

// Load and display training metadata
async function loadMetadata() {
    try {
        const response = await fetch('/metadata');
        const data = await response.json();
        
        // Update header badges
        document.getElementById('knnAccBadge').textContent = (data.knn.accuracy * 100).toFixed(1);
        document.getElementById('svmAccBadge').textContent = (data.svm.accuracy * 100).toFixed(1);
        
        // Update accuracy rings
        animateRing('knnCircle', data.knn.accuracy);
        animateRing('svmCircle', data.svm.accuracy);
        
        document.getElementById('knnAccuracy').textContent = `${(data.knn.accuracy * 100).toFixed(1)}%`;
        document.getElementById('svmAccuracy').textContent = `${(data.svm.accuracy * 100).toFixed(1)}%`;
        
        // Update metric details
        document.getElementById('knnPrecision').textContent = (data.knn.precision * 100).toFixed(1) + '%';
        document.getElementById('knnRecall').textContent = (data.knn.recall * 100).toFixed(1) + '%';
        document.getElementById('knnF1').textContent = (data.knn.f1_score * 100).toFixed(1) + '%';
        
        document.getElementById('svmPrecision').textContent = (data.svm.precision * 100).toFixed(1) + '%';
        document.getElementById('svmRecall').textContent = (data.svm.recall * 100).toFixed(1) + '%';
        document.getElementById('svmF1').textContent = (data.svm.f1_score * 100).toFixed(1) + '%';
        
        // Dataset info
        document.getElementById('infoSamples').textContent = data.dataset.total_samples;
        document.getElementById('infoResolution').textContent = data.preprocessing.resolution || '28×28';
        if (document.getElementById('infoHog') && data.preprocessing.hog_params) {
            document.getElementById('infoHog').textContent = data.preprocessing.hog_params.vector_size;
        }
        
    } catch (err) {
        console.error('Failed to load metadata:', err);
    }
}

// Animate accuracy ring
function animateRing(id, accuracy) {
    const circle = document.getElementById(id);
    const circumference = 2 * Math.PI * 52; // radius = 52
    const offset = circumference * (1 - accuracy);
    
    // Delay for visual effect
    setTimeout(() => {
        circle.style.strokeDashoffset = offset;
    }, 300);
}

// Visualization tab switching
function showViz(type) {
    const vizMap = {
        'samples': '/static/images/sample_digits.png',
        'confusion': '/static/images/confusion_matrices.png',
        'accuracy': '/static/images/accuracy_comparison.png',
        'f1': '/static/images/f1_comparison.png'
    };
    
    const img = document.getElementById('vizImage');
    img.style.opacity = '0';
    
    setTimeout(() => {
        img.src = vizMap[type];
        img.style.opacity = '1';
    }, 150);
    
    // Update active tab
    document.querySelectorAll('.viz-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
}

// Pattern Dictionary for AI Reasoning
const patternDictionary = {
    0: "Detected a closed-loop structure with symmetric intensity. The model identified no sharp terminal endpoints, indicating a continuous elliptical path.",
    1: "Identified a singular high-intensity vertical column. The HOG orientation is concentrated in the 90-degree bins, confirming a straight downward stroke.",
    2: "Found a curved upper arc followed by a sharp 45-degree diagonal descent and a stable horizontal foundation layer.",
    3: "Captured dual open convex curves meeting at a central horizontal intersection. The structural geometry shows high curvature in the top and bottom cells.",
    4: "Detected three distinct stroke intersections: two vertical components joined by a central horizontal bridge, forming a 'closed-top' or 'open-top' junction.",
    5: "Identified a horizontal top-bar, a short vertical spine, and a dominant weighted curve at the base. The model sees the 'hook' pattern clearly.",
    6: "Found a descending diagonal curve that transitions into a perfectly closed circular loop at the bottom. The structural mass is concentrated at the base.",
    7: "Detected a strong horizontal top stroke and a sharp-angled structural descent. The lack of a bottom base confirms the identifying 'slant' or 'crossbar' geometry.",
    8: "Captured two vertically stacked closed loops. The structural signatures show symmetric 'X' intersections at the central waist of the digit.",
    9: "Identified a closed circular loop at the top followed by a descending vertical or slightly curved spine. The top-heavy mass distribution is the key pattern."
};

/**
 * Update Technical Analysis for a specific digit index
 */
function updateTechnicalAnalysis(index) {
    if (!lastPredictionData) return;
    
    const data = lastPredictionData;
    const predictions = data.individual_predictions || [data.prediction];
    const confidences = data.confidences || [data.confidence]; // Backend returns 'confidence' for 1st, added 'confidences' list below
    
    // Safety check for index
    if (index >= predictions.length) index = 0;
    
    const targetDigit = predictions[index];
    const targetConf = (data.confidences && data.confidences[index]) ? data.confidences[index] : data.confidence;

    // Update Tiles (UI Overview)
    document.querySelectorAll('.analysis-tile').forEach((t, i) => {
        t.classList.toggle('active', i === index);
    });

    updateConfidenceBars(targetConf, targetDigit);
    updatePatternInsights(targetDigit);
}

/**
 * Show the structural-pattern description for the selected digit.
 * (This function was called but never defined before, which made the
 * Detailed UI show "Connection error" after every successful prediction.)
 */
function updatePatternInsights(digit) {
    const box = document.getElementById('patternInsights');
    const text = document.getElementById('patternText');
    if (!box || !text) return;
    const description = patternDictionary[digit];
    text.textContent = description || '';
    box.style.display = description ? 'block' : 'none';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initConfidenceBars();
    loadMetadata();
    loadDatasetGallery(); // Fix: Actually load the gallery on startup
    
    // Set initial model button state
    selectModel('svm');
});

