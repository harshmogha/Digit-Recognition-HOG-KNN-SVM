/* =================================================================
   Digit Recognizer - Minimalist Application Logic (v2)
   - wide drawing box for several digits
   - undo, keyboard shortcuts, optional auto-analyze
   - one card per detected digit (crop, digit, confidence)
   - boxes drawn on the canvas to show how the digits were split
   - SVM and KNN are both run so they can be compared
   ================================================================= */

// ---------------- State ----------------
let currentModel = 'svm';
let strokes = [];            // finished strokes: [[{x,y},...], ...]
let currentStroke = null;
let isDrawing = false;
let selectedDigit = 0;
let lastMain = null;         // response of the selected model
let lastAlt = null;          // response of the other model (for comparison)
let altModelName = 'knn';
let liveTimer = null;

const PEN_WIDTH = 26;        // in canvas pixels (canvas is 960 x 320)

// ---------------- Elements ----------------
const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const boxCanvas = document.getElementById('boxCanvas');
const boxCtx = boxCanvas.getContext('2d');
const hint = document.getElementById('canvasHint');
const mainPrediction = document.getElementById('mainPrediction');
const compareLine = document.getElementById('compareLine');
const statusMsg = document.getElementById('statusMsg');
const resultsWrap = document.getElementById('resultsWrap');
const digitResults = document.getElementById('digitResults');
const confidenceList = document.getElementById('confidenceList');
const btnUndo = document.getElementById('btnUndo');
const btnAnalyze = document.getElementById('btnAnalyze');
const liveToggle = document.getElementById('liveToggle');
const knnAcc = document.getElementById('knnAcc');
const svmAcc = document.getElementById('svmAcc');
const knnBar = document.getElementById('knnBar');
const svmBar = document.getElementById('svmBar');

// ---------------- Confidence colour scale ----------------
// low = red, middle = yellow, high = green (same scale as the Detailed UI)
//   <= 40 % red | 40-70 % red->yellow | 70-95 % yellow->green | >= 95 % green
function confColor(pct) {
    const p = Math.max(0, Math.min(100, Number(pct) || 0));
    let hue;
    if (p <= 40) hue = 0;
    else if (p <= 70) hue = ((p - 40) / 30) * 60;
    else if (p <= 95) hue = 60 + ((p - 70) / 25) * 60;
    else hue = 120;
    const light = 40 + 8 * (1 - Math.abs(hue - 60) / 60);
    return `hsl(${hue.toFixed(0)}, 90%, ${light.toFixed(0)}%)`;
}

// ---------------- Canvas drawing ----------------
function initCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = PEN_WIDTH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
}

function redrawAll() {
    initCanvas();
    strokes.forEach(stroke => {
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) ctx.lineTo(stroke[i].x, stroke[i].y);
        ctx.stroke();
    });
}

function clearOverlay() {
    boxCtx.clearRect(0, 0, boxCanvas.width, boxCanvas.height);
}

function getCoords(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height)
    };
}

function updateControls() {
    btnUndo.disabled = strokes.length === 0;
    hint.classList.toggle('hidden', strokes.length > 0 || isDrawing);
}

canvas.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* capture is optional */ }
    clearTimeout(liveTimer);
    isDrawing = true;
    currentStroke = [getCoords(e)];
    updateControls();
});

canvas.addEventListener('pointermove', (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const p = getCoords(e);
    const last = currentStroke[currentStroke.length - 1];
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    currentStroke.push(p);
});

function finishStroke() {
    if (!isDrawing) return;
    isDrawing = false;
    if (currentStroke && currentStroke.length >= 2) {
        strokes.push(currentStroke);
        if (liveToggle.checked) {
            clearTimeout(liveTimer);
            liveTimer = setTimeout(predict, 700);
        }
    }
    currentStroke = null;
    updateControls();
}

canvas.addEventListener('pointerup', finishStroke);
canvas.addEventListener('pointercancel', finishStroke);

// ---------------- Controls ----------------
function resetResults() {
    mainPrediction.textContent = '?';
    mainPrediction.classList.remove('predicted');
    mainPrediction.style.fontSize = '';
    compareLine.innerHTML = '';
    statusMsg.textContent = '';
    statusMsg.className = 'status-msg';
    resultsWrap.hidden = true;
    digitResults.innerHTML = '';
    confidenceList.innerHTML = '<div class="empty-state">Prediction required</div>';
    clearOverlay();
    lastMain = null;
    lastAlt = null;
    selectedDigit = 0;
}

function clearCanvas() {
    clearTimeout(liveTimer);
    strokes = [];
    currentStroke = null;
    isDrawing = false;
    initCanvas();
    resetResults();
    updateControls();
}

function undoStroke() {
    if (!strokes.length) return;
    clearTimeout(liveTimer);
    strokes.pop();
    redrawAll();
    updateControls();
    if (!strokes.length) {
        resetResults();
    } else if (lastMain) {
        predict();   // results were on screen, so refresh them
    } else {
        clearOverlay();
    }
}

document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentModel = btn.dataset.model;
        if (strokes.length) predict();
    });
});

document.addEventListener('keydown', (e) => {
    if (e.target && ['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
    if (e.key === 'Enter' && e.target === document.body) {
        e.preventDefault();
        predict();
    } else if (e.key === 'Escape') {
        clearCanvas();
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoStroke();
    }
});

// ---------------- Prediction ----------------
async function requestPrediction(model, imageData) {
    const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, model })
    });
    return response.json();
}

async function predict() {
    if (!strokes.length) return;
    clearTimeout(liveTimer);

    const originalLabel = btnAnalyze.innerHTML;
    btnAnalyze.disabled = true;
    btnAnalyze.textContent = 'Analyzing...';
    statusMsg.textContent = '';
    statusMsg.className = 'status-msg';

    try {
        const imageData = canvas.toDataURL('image/png');
        altModelName = currentModel === 'svm' ? 'knn' : 'svm';
        const [main, alt] = await Promise.all([
            requestPrediction(currentModel, imageData),
            requestPrediction(altModelName, imageData).catch(() => null)
        ]);

        if (main.error) {
            resetResults();
            statusMsg.textContent = main.error === 'No digits detected'
                ? 'No digits detected - draw a bit larger or thicker.'
                : `Error: ${main.error}`;
            statusMsg.className = 'status-msg error';
            return;
        }

        lastMain = main;
        lastAlt = alt && !alt.error ? alt : null;
        if (selectedDigit >= main.individual_predictions.length) selectedDigit = 0;

        renderPrediction();
        renderDigitCards();
        renderConfidence(selectedDigit);
        drawBoxes();
    } catch (err) {
        console.error('Prediction failed:', err);
        statusMsg.textContent = 'Could not reach the server - is it running?';
        statusMsg.className = 'status-msg error';
    } finally {
        btnAnalyze.disabled = false;
        btnAnalyze.innerHTML = originalLabel;
    }
}

function topConfidence(result, index) {
    const pred = result.individual_predictions[index];
    return result.confidences[index][String(pred)] ?? 0;
}

function renderPrediction() {
    const text = String(lastMain.prediction);
    mainPrediction.textContent = text;
    const n = text.length;
    mainPrediction.style.fontSize = n > 8 ? '1.8rem' : n > 5 ? '2.4rem' : n > 3 ? '3rem' : '4rem';
    mainPrediction.classList.remove('predicted');
    void mainPrediction.offsetWidth;
    mainPrediction.classList.add('predicted');

    // SVM vs KNN comparison
    if (!lastAlt) {
        compareLine.textContent = '';
        return;
    }
    const mainName = currentModel.toUpperCase();
    const altName = altModelName.toUpperCase();
    const a = lastMain.individual_predictions;
    const b = lastAlt.individual_predictions;
    const differing = [];
    for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if (a[i] !== b[i]) differing.push(i + 1);
    }
    const verdict = differing.length === 0
        ? '<span class="agree">✓ models agree</span>'
        : `<span class="differ">≠ differ at digit ${differing.join(', ')}</span>`;
    compareLine.innerHTML = `${mainName} ${lastMain.prediction} · ${altName} ${lastAlt.prediction} - ${verdict}`;
}

function renderDigitCards() {
    const preds = lastMain.individual_predictions;
    resultsWrap.hidden = false;
    digitResults.innerHTML = '';

    preds.forEach((pred, i) => {
        const conf = topConfidence(lastMain, i);
        const altPred = lastAlt ? lastAlt.individual_predictions[i] : null;

        const card = document.createElement('div');
        card.className = 'digit-card' + (i === selectedDigit ? ' selected' : '');
        card.style.animationDelay = `${i * 40}ms`;
        card.dataset.index = i;

        // cropped 28x28 image that the model really sees
        const thumb = document.createElement('canvas');
        thumb.width = 28;
        thumb.height = 28;
        thumb.className = 'dc-thumb';
        const tctx = thumb.getContext('2d');
        const img = tctx.createImageData(28, 28);
        const flat = lastMain.processed_images[i].flat();
        for (let k = 0; k < flat.length; k++) {
            const v = flat[k];
            img.data[k * 4] = v;
            img.data[k * 4 + 1] = v;
            img.data[k * 4 + 2] = v;
            img.data[k * 4 + 3] = 255;
        }
        tctx.putImageData(img, 0, 0);

        const idx = document.createElement('div');
        idx.className = 'dc-index';
        idx.textContent = `Digit ${i + 1}`;
        card.appendChild(idx);
        card.appendChild(thumb);

        const body = document.createElement('div');
        const differs = altPred !== null && altPred !== pred;
        body.innerHTML = `
            <div class="dc-digit">${pred}</div>
            <div class="dc-conf">${conf.toFixed(1)}%</div>
            <div class="dc-bar"><div style="width:${conf}%; background:${confColor(conf)}"></div></div>
            ${altPred === null ? '' : `<div class="dc-alt ${differs ? 'differ' : ''}">${altModelName.toUpperCase()}: ${altPred}${differs ? ' ≠' : ' ✓'}</div>`}
        `;
        card.appendChild(body);

        card.addEventListener('click', () => selectDigit(i));
        digitResults.appendChild(card);
    });
}

function selectDigit(index) {
    selectedDigit = index;
    document.querySelectorAll('.digit-card').forEach((c, i) => c.classList.toggle('selected', i === index));
    renderConfidence(index);
    drawBoxes();
}

function renderConfidence(index) {
    if (!lastMain) return;
    const pred = lastMain.individual_predictions[index];
    const conf = lastMain.confidences[index];
    const total = lastMain.individual_predictions.length;

    confidenceList.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'digit-header';
    header.innerHTML = `Digit ${index + 1}: <span>${pred}</span>` +
        `<small>${currentModel.toUpperCase()} · top 5 of 10 classes${total > 1 ? ` · digit ${index + 1} of ${total}` : ''}</small>`;
    confidenceList.appendChild(header);

    Object.entries(conf)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .forEach(([digit, value]) => {
            const item = document.createElement('div');
            item.className = 'conf-item' + (digit === String(pred) ? ' top' : '');
            item.innerHTML = `
                <span class="conf-digit">${digit}</span>
                <div class="conf-bar-outer">
                    <div class="conf-bar-inner" style="width:${value}%; background:${confColor(value)}"></div>
                </div>
                <span class="conf-val">${value.toFixed(2)}%</span>
            `;
            confidenceList.appendChild(item);
        });
}

// Boxes on the canvas = how the drawing was split into digits
function drawBoxes() {
    clearOverlay();
    if (!lastMain || !lastMain.boxes) return;
    const pad = 8;
    boxCtx.textBaseline = 'alphabetic';

    lastMain.boxes.forEach((box, i) => {
        const [x1, y1, x2, y2] = box;
        const color = confColor(topConfidence(lastMain, i));
        const selected = i === selectedDigit;

        boxCtx.lineWidth = selected ? 4 : 2.5;
        boxCtx.strokeStyle = color;
        boxCtx.setLineDash(selected ? [] : [10, 6]);
        boxCtx.strokeRect(x1 - pad, y1 - pad, (x2 - x1) + 2 * pad, (y2 - y1) + 2 * pad);
        boxCtx.setLineDash([]);

        // small label chip: digit + position
        const label = `${i + 1}: ${lastMain.individual_predictions[i]}`;
        boxCtx.font = 'bold 22px "JetBrains Mono", monospace';
        const w = boxCtx.measureText(label).width + 16;
        const lx = Math.max(0, x1 - pad);
        const ly = Math.max(0, y1 - pad - 30);
        boxCtx.fillStyle = color;
        boxCtx.fillRect(lx, ly, w, 28);
        boxCtx.fillStyle = '#000';
        boxCtx.fillText(label, lx + 8, ly + 21);
    });
}

// ---------------- Metadata (accuracy cards) ----------------
async function loadMetadata() {
    try {
        const response = await fetch('/metadata');
        const data = await response.json();

        const kAcc = (data.knn.accuracy * 100).toFixed(1);
        const sAcc = (data.svm.accuracy * 100).toFixed(1);

        knnAcc.textContent = `${kAcc}%`;
        svmAcc.textContent = `${sAcc}%`;

        setTimeout(() => {
            knnBar.style.width = `${kAcc}%`;
            svmBar.style.width = `${sAcc}%`;
        }, 500);
    } catch (err) {
        console.error('Failed to load metadata:', err);
    }
}

// ---------------- Init ----------------
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    updateControls();
    loadMetadata();
});
