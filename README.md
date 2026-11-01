<div align="center">

# 🔢 Digit Recognizer


### Handwritten digits → HOG → KNN & SVM

</div>

<p align="center">
  <i>Draw one or many digits · HOG features + KNN + SVM side by side · Live confidence scores: red to green · Minimal and Detailed interfaces · Fetch MNIST, train, run</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.12-3776AB?style=for-the-badge&logo=python&logoColor=white"/>
  <img src="https://img.shields.io/badge/Flask-3.0.3-000000?style=for-the-badge&logo=flask&logoColor=white"/>
  <img src="https://img.shields.io/badge/scikit--learn-ML-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white"/>
  <img src="https://img.shields.io/badge/scikit--image-HOG-3F8A3F?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/NumPy-Arrays-013243?style=for-the-badge&logo=numpy&logoColor=white"/>
  <br/>
  <img src="https://img.shields.io/badge/JavaScript-Vanilla-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/HTML5-Canvas-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-Responsive-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/Dataset-MNIST-8A2BE2?style=for-the-badge"/>
  <img src="https://img.shields.io/badge/SVM%20accuracy-98%25-success?style=for-the-badge"/>
</p>

<p align="center">
  <a href="#-about">About</a> •
  <a href="#-highlights">Highlights</a> •
  <a href="#-screenshots">Screenshots</a> •
  <a href="#-how-it-works">How it works</a> •
  <a href="#-results">Results</a> •
  <a href="#-quick-start">Quick start</a> •
  <a href="#-using-the-app">Using the app</a> •
  <a href="#-api">API</a> •
  <a href="#-project-structure">Structure</a> •
  <a href="#-limitations">Limitations</a> •
  <a href="#-roadmap">Roadmap</a>
</p>

<br/>

<p align="center">
  <img src="docs/screenshots/minimal-ui.png" alt="Minimal interface recognising the number 1234" width="920"/>
</p>

<p align="center"><sub>The Minimal interface reading a four digit number. Boxes show how the drawing was split, and every box is coloured by the model's confidence.</sub></p>

<br/>

---

## 💫 About

**Digit Recognizer** is a complete handwritten digit recognition system, from raw data to a live web app. You draw **one digit or a whole number** on a canvas, and the app splits it into separate digits, describes each one with **HOG (Histogram of Oriented Gradients)** features, and classifies it with two classic models, **KNN** and **SVM**, at the same time.

Everything the app needs is **built by the code itself**. No dataset and no trained model is stored in this repository: one script downloads MNIST, another trains the models, and then the server runs.

<br/>

<p align="center">
<table align="center">
  <tr>
    <td align="center">
      <h2>98.06%</h2>
      <sub><b>SVM accuracy</b><br/>(8,000 unseen test images)</sub>
    </td>
    <td align="center">
      <h2>95.69%</h2>
      <sub><b>KNN accuracy</b><br/>(same test images)</sub>
    </td>
    <td align="center">
      <h2>324</h2>
      <sub><b>HOG features</b><br/>per digit (from 784 pixels)</sub>
    </td>
    <td align="center">
      <h2>40,000</h2>
      <sub><b>MNIST images used</b><br/>32,000 train / 8,000 test</sub>
    </td>
  </tr>
</table>
</p>

<br/>

---

## ✨ Highlights

<table>
  <tr>
    <th align="center">🏷️</th>
    <th>Feature</th>
    <th>What it gives you</th>
  </tr>
  <tr>
    <td align="center">✍️</td>
    <td><b>Multi-digit input</b></td>
    <td>Draw a whole number. Digits are separated automatically with connected-component analysis and read left to right.</td>
  </tr>
  <tr>
    <td align="center">🧭</td>
    <td><b>HOG feature extraction</b></td>
    <td>Digits are described by stroke direction (9 bins, 7×7 cells, 2×2 blocks), not by raw pixels.</td>
  </tr>
  <tr>
    <td align="center">⚔️</td>
    <td><b>KNN vs SVM, live</b></td>
    <td>Both models run on every drawing. The app shows the answer of the selected model and tells you whether the other one agrees.</td>
  </tr>
  <tr>
    <td align="center">🚦</td>
    <td><b>Colour-coded confidence</b></td>
    <td>Every digit gets a confidence score, coloured from red (low) through yellow to green (high).</td>
  </tr>
  <tr>
    <td align="center">🔲</td>
    <td><b>See how it split your drawing</b></td>
    <td>Boxes are drawn on the canvas around each detected digit, next to the cropped 28×28 image the model really sees.</td>
  </tr>
  <tr>
    <td align="center">🔀</td>
    <td><b>Two interfaces, one click</b></td>
    <td>A <b>Minimal</b> UI (default) and a <b>Detailed</b> UI with HOG maps, metrics and a dataset gallery. Switch from the top-right corner.</td>
  </tr>
  <tr>
    <td align="center">⌨️</td>
    <td><b>Comfortable drawing</b></td>
    <td>Wide canvas, undo, clear, keyboard shortcuts, optional auto-analyze, mouse and touch support.</td>
  </tr>
  <tr>
    <td align="center">🧪</td>
    <td><b>Reproducible pipeline</b></td>
    <td><code>fetch_mnist.py</code> → <code>train_model.py</code> → <code>app.py</code>. Models are never committed.</td>
  </tr>
</table>

<br/>

---

## 🖼️ Screenshots

### 🔹 Minimal interface (opens by default)

Clean white workspace. One card per detected digit shows the cropped image, the prediction, its confidence and what the other model said.

<p align="center">
  <img src="docs/screenshots/minimal-ui.png" alt="Minimal interface" width="900"/>
</p>

### 🔹 Uncertainty is visible

The last digit below is a thin, straight **7** that both models read as a **1**. The model is not sure, so that digit gets a **yellow** box and a **70%** score, which tells you to double-check it.

<p align="center">
  <img src="docs/screenshots/minimal-ui-uncertain.png" alt="Low confidence digit shown in yellow" width="900"/>
</p>

### 🔹 Detailed interface

Everything the model does, laid out: intensity maps, HOG maps, all 10 confidence bars per digit, training metrics, a dataset gallery and training charts.

<p align="center">
  <img src="docs/screenshots/detailed-ui.png" alt="Detailed interface" width="900"/>
</p>

<sub>Screenshots are taken from the running app. The digits were drawn by a script that replays pointer strokes.</sub>

<br/>

---

## 🧠 How it works

### 1️⃣ From drawing to answer

```mermaid
flowchart LR
    A["Draw on canvas<br/>one or many digits"] --> B["Split into digits<br/>connected components"]
    B --> C["Crop, pad to square,<br/>resize to 28 x 28"]
    C --> D["HOG features<br/>324 numbers"]
    D --> E["StandardScaler"]
    E --> F{"Model"}
    F -->|SVM| G["Digit + confidence"]
    F -->|KNN| G
    classDef step fill:#eef2ff,stroke:#4f46e5,color:#111,stroke-width:1.5px;
    classDef out fill:#dcfce7,stroke:#16a34a,color:#111,stroke-width:1.5px;
    class A,B,C,D,E,F step;
    class G out;
```

### 2️⃣ From nothing to a trained model

```mermaid
flowchart LR
    S1["fetch_mnist.py<br/>download 70,000 images"] --> S2[("models/<br/>mnist_data.joblib")]
    S2 --> S3["train_model.py<br/>HOG, split, scale, train"]
    S3 --> S4[("models/<br/>knn, svm, scaler,<br/>metadata.json")]
    S3 --> S5["static/images<br/>accuracy and confusion charts"]
    S4 --> S6["app.py<br/>Flask server on port 5000"]
    classDef code fill:#eef2ff,stroke:#4f46e5,color:#111,stroke-width:1.5px;
    classDef store fill:#fef9c3,stroke:#ca8a04,color:#111,stroke-width:1.5px;
    class S1,S3,S5,S6 code;
    class S2,S4 store;
```

### 3️⃣ Why HOG?

HOG ignores brightness and records **which direction the strokes go**: a `1` is mostly vertical, a `7` has a horizontal bar and a diagonal, a `0` curves all the way around.

| Step | Setting in this project | Result |
|:--|:--|:--|
| **Gradients** | change in brightness left/right and up/down | edge strength and direction per pixel |
| **Orientation bins** | 9 bins, 20 degrees each (0 to 180) | each pixel votes into one direction |
| **Cells** | 7×7 pixels, so a 4×4 grid | 16 cells × 9 bins = 144 numbers |
| **Blocks** | 2×2 cells, sliding by one cell (9 blocks), L2-Hys normalised | contrast robust, overlapping |
| **Feature vector** | 9 blocks × 4 cells × 9 bins | **324 numbers** instead of 784 pixels |

> [!NOTE]
> **A measured note.** On clean, perfectly centred MNIST images, raw pixels reach about the same accuracy as HOG (SVM 98.4% vs 98.2% in a one-off comparison on the same split). The benefit of HOG is **robustness and speed**: when the test digits were shifted by 2 pixels, a raw-pixel SVM fell to 51.6% while the HOG SVM kept 85.0%, and HOG trained the SVM about 3.7× faster. That matters for hand-drawn input.

### 4️⃣ KNN and SVM

<table>
  <tr>
    <th></th>
    <th>🔵 KNN</th>
    <th>🟣 SVM</th>
  </tr>
  <tr>
    <td><b>Idea</b></td>
    <td>The 3 most similar training digits vote</td>
    <td>A curved boundary with the widest possible margin between digits</td>
  </tr>
  <tr>
    <td><b>Settings</b></td>
    <td><code>k=3</code>, Euclidean distance, <code>weights="distance"</code></td>
    <td>RBF kernel, <code>C=10</code>, <code>gamma="scale"</code></td>
  </tr>
  <tr>
    <td><b>Learns</b></td>
    <td>Nothing, it stores the 32,000 training vectors</td>
    <td>About 7.8k support vectors (the hardest border examples)</td>
  </tr>
  <tr>
    <td><b>Multi-class</b></td>
    <td>Direct vote</td>
    <td>45 one-vs-one classifiers, then voting</td>
  </tr>
  <tr>
    <td><b>Confidence</b></td>
    <td>Share of the distance-weighted vote</td>
    <td>Platt scaling plus pairwise coupling</td>
  </tr>
  <tr>
    <td><b>Training</b></td>
    <td>Instant</td>
    <td>Slower (also calibrates probabilities)</td>
  </tr>
  <tr>
    <td><b>Strength</b></td>
    <td>Simple and easy to explain</td>
    <td>More accurate, graded confidence, smaller model</td>
  </tr>
</table>

### 5️⃣ Reading several digits

```mermaid
flowchart LR
    M1["Threshold<br/>pixel above 100"] --> M2["Label touching<br/>white blobs"] --> M3["Drop specks<br/>area below 20 px"] --> M4["Sort blobs<br/>left to right"] --> M5["Classify each blob<br/>on its own"] --> M6["Join the results<br/>1 + 2 + 3 + 4 = 1234"]
    classDef step fill:#eef2ff,stroke:#4f46e5,color:#111,stroke-width:1.5px;
    class M1,M2,M3,M4,M5,M6 step;
```

There is no line drawn between digits: each digit is a separate blob of white pixels, and the box around it is its bounding box. **Leave a small gap between digits** and do not let them touch.

### 6️⃣ The confidence colour scale

| Confidence | Colour | Meaning |
|:--|:--:|:--|
| 40% or lower | 🟥 Red | The model is unsure, check this digit |
| about 70% | 🟨 Yellow | Doubtful |
| 95% or higher | 🟩 Green | Very reliable |

Values in between blend smoothly. The scale is fixed, so red really means low confidence: if every digit is sure, every digit is green.

<br/>

---

## 📊 Results

Measured on **8,000 MNIST images the models never saw** during training.

<table align="center">
  <tr>
    <th>Model</th>
    <th align="center">Accuracy</th>
    <th align="center">Precision</th>
    <th align="center">Recall</th>
    <th align="center">F1</th>
    <th align="center">Mistakes</th>
  </tr>
  <tr>
    <td>🟣 <b>SVM</b> (RBF, C=10)</td>
    <td align="center"><b>98.06%</b></td>
    <td align="center">0.981</td>
    <td align="center">0.981</td>
    <td align="center">0.981</td>
    <td align="center">155</td>
  </tr>
  <tr>
    <td>🔵 <b>KNN</b> (k=3)</td>
    <td align="center">95.69%</td>
    <td align="center">0.958</td>
    <td align="center">0.957</td>
    <td align="center">0.957</td>
    <td align="center">345</td>
  </tr>
</table>

<br/>

SVM makes about **55% fewer mistakes** than KNN. The biggest difference is on look-alike digits: KNN turned 55 test fours into nines, SVM only 10.

<p align="center">
  <img src="static/images/confusion_matrices.png" alt="Confusion matrices for KNN and SVM" width="900"/>
</p>

<details>
<summary><b>📋 Recall per digit (click to expand)</b></summary>

<br/>

| Digit | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 |
|:--|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| 🟣 **SVM** | 98.7 | 98.9 | 98.9 | 97.3 | 97.7 | 98.9 | 98.4 | 97.3 | 97.6 | 97.0 |
| 🔵 **KNN** | 98.7 | 97.7 | 94.4 | 95.7 | 91.6 | 94.0 | 99.0 | 94.5 | 94.6 | 96.5 |

Values are percentages from one training run. The 40,000 images are sampled randomly each time you train, so your numbers will differ a little.
</details>

> [!TIP]
> **Confidence is meaningful.** On images not used for training, SVM predictions with confidence above 99.995% were right 100% of the time, while predictions between 50% and 70% were right about 69% of the time. KNN confidence is coarser: it shows exactly 100% for most answers, and about 1% of those are still wrong.

<br/>

---

## 🚀 Quick start

> [!IMPORTANT]
> Nothing to download by hand. The dataset is fetched by the code and the models are trained by the code.

<br/>

**`Step 1`** &nbsp; Clone and create an environment

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>

python -m venv .venv

# Windows (PowerShell)
.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate
```

**`Step 2`** &nbsp; Install the dependencies

```bash
pip install flask flask-cors numpy scikit-learn scikit-image pillow joblib matplotlib seaborn
```

**`Step 3`** &nbsp; Download MNIST <sub>(needs internet, about 26 MB cached in `models/`)</sub>

```bash
python fetch_mnist.py
```

**`Step 4`** &nbsp; Train the models <sub>(HOG extraction, KNN, SVM, evaluation charts; this can take a few minutes)</sub>

```bash
python train_model.py
```

**`Step 5`** &nbsp; Run the app

```bash
python app.py
```

🌐 Open **http://localhost:5000**. The Minimal interface opens first, and the **Interface** switch in the top-right corner jumps to the Detailed one (`/old`).

<br/>

<details>
<summary><b>🧰 Tested with</b></summary>

<br/>

| Package | Version |
|:--|:--|
| Python | 3.12 |
| Flask / flask-cors | 3.0.3 / 4.0.0 |
| NumPy | 2.4.4 |
| scikit-learn | 1.9.1 |
| scikit-image | 0.26.0 |
| Pillow | 12.2.0 |
| joblib | 1.5.3 |
| matplotlib / seaborn | 3.11.2 / 0.13.2 |

> [!WARNING]
> Always train the models with the same scikit-learn version you use to run the app. Saved models can trigger a version warning if the two differ.

</details>

<br/>

---

## 🎮 Using the app

| Action | How |
|:--|:--|
| **Draw** | Click and drag (or touch) on the black canvas. Write large, with white ink. |
| **Several digits** | Leave a small gap between digits and lift the pen between them. |
| **Analyze** | **Analyze Drawing** button or <kbd>Enter</kbd> |
| **Undo last stroke** | **Undo** button or <kbd>Ctrl</kbd> + <kbd>Z</kbd> |
| **Clear** | **Clear** button or <kbd>Esc</kbd> |
| **Change model** | **SVM / KNN** toggle |
| **Analyze automatically** | Tick **Auto-analyze** (runs shortly after you stop drawing) |
| **See another digit's scores** | Click its card under the canvas |
| **Switch interface** | **Minimal / Detailed** switch, top-right corner |

> [!TIP]
> **For the best accuracy:** draw digits tall and clear, keep them separate, and write a `7` with a small curve or a cross-bar if it gets read as a `1`.

<br/>

---

## 🔌 API

The browser talks to a small JSON API, so you can also call it from scripts.

| Method | Route | Purpose |
|:--|:--|:--|
| `GET` | `/` | Minimal interface |
| `GET` | `/old` | Detailed interface (`/new` redirects to `/`) |
| `POST` | `/predict` | Recognise the digits in a drawing |
| `GET` | `/metadata` | Accuracy, precision, recall, F1 and HOG settings |
| `GET` | `/dataset-samples` | 15 random MNIST training images (for the gallery) |
| `GET` | `/health` | Quick health check |

<details>
<summary><b>📡 /predict request and response</b></summary>

<br/>

Send a white-on-black PNG as a base64 data URL:

```json
{
  "image": "data:image/png;base64,iVBORw0KGgo...",
  "model": "svm"
}
```

`model` is `"svm"` (default) or `"knn"`. The response:

```json
{
  "prediction": "1234",
  "individual_predictions": [1, 2, 3, 4],
  "confidences": [ { "0": 0.0, "1": 98.87, "...": "..." } ],
  "boxes": [[x1, y1, x2, y2]],
  "processed_images": [ [[0, 0, "... 28 x 28 pixels ..."]] ],
  "hog_visualizations": [ [[0, 0, "... 28 x 28 pixels ..."]] ],
  "model": "svm"
}
```

`confidences` holds one dictionary per digit with a percentage for each class `0` to `9`. `boxes` are bounding boxes on the original canvas. Errors come back as `{"error": "..."}` with status 400 (for example `No digits detected`) or 500.
</details>

<br/>

---

## 📁 Project structure

```text
.
├── app.py                    Flask server: segmentation, HOG, prediction API
├── fetch_mnist.py            Downloads MNIST and caches it in models/
├── train_model.py            HOG, split, scaling, KNN, SVM, evaluation charts
├── templates/
│   ├── new_ui.html           Minimal interface (served at /)
│   └── old_ui.html           Detailed interface (served at /old)
├── static/
│   ├── new_app.js            Minimal UI logic
│   ├── new_style.css         Minimal UI styles
│   ├── app.js                Detailed UI logic
│   ├── style.css             Detailed UI styles
│   └── images/               Charts shown by the Detailed UI
├── docs/screenshots/         Images used in this README
├── .gitignore
└── models/                   Created locally by the scripts, NOT in git
    ├── mnist_data.joblib     dataset cache      (fetch_mnist.py)
    ├── knn_model.joblib      trained KNN        (train_model.py)
    ├── svm_model.joblib      trained SVM        (train_model.py)
    ├── scaler.joblib          fitted scaler      (train_model.py)
    └── metadata.json         metrics and settings (train_model.py)
```

<br/>

---

## ⚠️ Limitations

- The models are trained on **MNIST**, not on mouse-drawn digits, so accuracy on your own drawings can be lower than the numbers above.
- **Touching or overlapping digits** are merged into one blob and read as a single digit. A digit written in two separate pieces can be split in two.
- There is **no "unknown" class**: a scribble or a letter still gets a digit. Use the confidence colour as a warning.
- The 40,000 training images are sampled randomly (no fixed seed), so results change slightly each time you retrain.
- `app.py` runs Flask in **debug mode** on port 5000. That is fine for local use, not for production.
- Model files are saved with `joblib` (pickle based). Only load model files that you created yourself.

<br/>

---

## 🙏 Credits

- **MNIST** handwritten digits by Yann LeCun, Corinna Cortes and Christopher Burges.
- **HOG** by Navneet Dalal and Bill Triggs (CVPR 2005).
- **libsvm** (Chang and Lin) through **scikit-learn**, and **scikit-image** for the HOG implementation.
- **Flask** for the web server.

<br/>

<p align="center">—— ⭐ ——</p>

<p align="center"><sub>If this project helped you, consider giving it a ⭐</sub></p>
