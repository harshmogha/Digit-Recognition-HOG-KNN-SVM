<a id="top"></a>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00C6FF,50:4F46E5,100:F107A3&height=240&section=header&text=Digit%20Recognizer&fontSize=64&fontColor=ffffff&fontAlignY=38&desc=Handwritten%20digits%20%E2%86%92%20HOG%20%E2%86%92%20KNN%20%26%20SVM&descAlignY=60&descSize=22&animation=fadeIn" alt="Digit Recognizer"/>
</p>

<p align="center">
  <img src="https://readme-typing-svg.herokuapp.com/?font=Fira+Code&weight=600&size=22&pause=1000&color=4F46E5&center=true&vCenter=true&width=760&height=50&lines=Draw+one+or+many+digits;HOG+features+%2B+KNN+%2B+SVM+side+by+side;Live+confidence+scores%3A+red+to+green;Minimal+and+Detailed+interfaces;Fetch+MNIST%2C+train%2C+run" alt="Typing animation"/>
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
  <a href="#-about"><img src="https://img.shields.io/badge/About-00C6FF?style=flat-square"/></a>
  <a href="#-highlights"><img src="https://img.shields.io/badge/Highlights-3B82F6?style=flat-square"/></a>
  <a href="#-screenshots"><img src="https://img.shields.io/badge/Screenshots-4F46E5?style=flat-square"/></a>
  <a href="#-how-it-works"><img src="https://img.shields.io/badge/How%20it%20works-6D28D9?style=flat-square"/></a>
  <a href="#-results"><img src="https://img.shields.io/badge/Results-8B5CF6?style=flat-square"/></a>
  <a href="#-quick-start"><img src="https://img.shields.io/badge/Quick%20start-A21CAF?style=flat-square"/></a>
  <br/>
  <a href="#-using-the-app"><img src="https://img.shields.io/badge/Using%20the%20app-C026D3?style=flat-square"/></a>
  <a href="#-api"><img src="https://img.shields.io/badge/API-DB2777?style=flat-square"/></a>
  <a href="#-project-structure"><img src="https://img.shields.io/badge/Structure-E11D48?style=flat-square"/></a>
  <a href="#-limitations"><img src="https://img.shields.io/badge/Limitations-F43F5E?style=flat-square"/></a>
  <a href="#-roadmap"><img src="https://img.shields.io/badge/Roadmap-F107A3?style=flat-square"/></a>
</p>

<p align="center">
  <img src="docs/screenshots/minimal-ui.png" alt="Minimal interface recognising the number 1234" width="920"/>
</p>
<p align="center"><sub>The <b>Minimal</b> interface reading a four digit number. Boxes show how the drawing was split, and every box is coloured by the model's confidence.</sub></p>

---

## 💫 About

**Digit Recognizer** is a complete handwritten digit recognition system, from raw data to a live web app. You draw **one digit or a whole number** on a canvas, and the app splits it into separate digits, describes each one with **HOG (Histogram of Oriented Gradients)** features, and classifies it with two classic models, **KNN** and **SVM**, at the same time.

> [!NOTE]
> No deep learning here, on purpose. This project shows how far well-engineered features and classic machine learning can go: **98% accuracy** on MNIST with an SVM, running instantly on a CPU.

<br/>

## ✨ Highlights

<table>
  <tr>
    <td align="center" width="33%">
      <h3>✍️ Draw anything</h3>
      One digit or a whole number. The app finds and separates each digit for you.
    </td>
    <td align="center" width="33%">
      <h3>⚔️ KNN vs SVM</h3>
      Both models predict every digit side by side, so you can compare them live.
    </td>
    <td align="center" width="33%">
      <h3>🧬 HOG features</h3>
      Shape-based descriptors that care about strokes and edges, not raw pixels.
    </td>
  </tr>
  <tr>
    <td align="center">
      <h3>🚦 Live confidence</h3>
      Every digit box is coloured from <b>red</b> (unsure) to <b>green</b> (confident).
    </td>
    <td align="center">
      <h3>🎛️ Two interfaces</h3>
      <b>Minimal</b> for a clean demo, <b>Detailed</b> for a look under the hood.
    </td>
    <td align="center">
      <h3>⚡ One-flow setup</h3>
      Fetch MNIST, train, run. Three steps from clone to working app.
    </td>
  </tr>
</table>

<br/>

## 📸 Screenshots

<table>
  <tr>
    <td align="center" width="50%">
      <img src="docs/screenshots/minimal-ui.png" alt="Minimal interface"/>
      <br/><b>Minimal</b><br/><sub>Draw, read, done.</sub>
    </td>
    <td align="center" width="50%">
      <img src="docs/screenshots/detailed-ui.png" alt="Detailed interface"/>
      <br/><b>Detailed</b><br/><sub>Per-digit scores for KNN and SVM.</sub>
    </td>
  </tr>
</table>

<br/>

## 🧠 How it works

```mermaid
flowchart LR
    A["✍️ Canvas drawing"] --> B["✂️ Split into digits"]
    B --> C["🧹 Normalise<br/>crop · pad · resize"]
    C --> D["🧬 HOG features"]
    D --> E["🔎 KNN"]
    D --> F["⚡ SVM"]
    E --> G["🎯 Prediction<br/>+ confidence"]
    F --> G

    classDef io fill:#4F46E5,stroke:#312E81,color:#fff,stroke-width:2px;
    classDef model fill:#F107A3,stroke:#9D174D,color:#fff,stroke-width:2px;
    class A,G io;
    class E,F model;
```

| Step | What happens |
| :--: | :-- |
| **1. Draw** | The HTML5 canvas captures your strokes and sends the image to the Flask backend. |
| **2. Split** | The drawing is separated into individual digits, each with its own bounding box. |
| **3. Normalise** | Each digit is cropped, padded and resized to the MNIST format. |
| **4. Describe** | `scikit-image` turns every digit into a **HOG** feature vector. |
| **5. Classify** | **KNN** and **SVM** both predict the digit from the same features. |
| **6. Show** | Predictions and confidence scores come back and the boxes light up red → green. |

> [!TIP]
> **Why HOG?** Raw pixels change a lot with small shifts and stroke thickness. HOG records the *direction of edges* instead, which is what actually makes a "4" look like a "4".

<br/>

## 📊 Results

| Model | Features | Dataset | Test accuracy |
| :-- | :-- | :--: | :--: |
| ⚡ **SVM** | HOG | MNIST | **98%** |
| 🔎 **KNN** | HOG | MNIST | — <!-- add your KNN accuracy --> |

<sub>Accuracy is measured on the held-out MNIST test set.</sub>

<br/>

## 🚀 Quick start

**Requirements:** Python 3.12+

```bash
# 1. Clone the project
git clone https://github.com/<your-username>/digit-recognizer.git
cd digit-recognizer

# 2. Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt
```

Then fetch the data, train the models and launch the app:

```bash
python fetch_mnist.py     # download MNIST
python train.py           # extract HOG features, train KNN + SVM
python app.py             # start the web app
```

Open **http://127.0.0.1:5000** in your browser and start drawing. ✍️

> [!TIP]
> Training happens once. After that, just run `python app.py` whenever you want to use the app.

<br/>

## 🎨 Using the app

<table>
  <tr>
    <td width="50%" valign="top">
      <h4>🟣 Minimal</h4>
      A clean canvas with the recognised number shown right away. Great for demos.
    </td>
    <td width="50%" valign="top">
      <h4>🔵 Detailed</h4>
      Shows each split digit with KNN and SVM predictions and their confidence scores.
    </td>
  </tr>
</table>

**Reading the confidence colours**

| Colour | Meaning |
| :--: | :-- |
| 🔴 | Low confidence, the model is unsure |
| 🟠 | Below average |
| 🟡 | Fairly confident |
| 🟢 | High confidence |

**For the best results**

- ✏️ Draw **big and centred**, using a thick stroke
- ↔️ Leave a **small gap** between digits so they split cleanly
- 🧽 Hit **Clear** between attempts

<br/>

## 🔌 API

<details>
<summary><b>Click to view the prediction endpoint</b></summary>

<br/>

**`POST /predict`**

```json
{
  "image": "data:image/png;base64,iVBORw0KGgo..."
}
```

**Response**

```json
{
  "digits": [
    {
      "box": [12, 20, 64, 96],
      "knn": { "label": 1, "confidence": 0.92 },
      "svm": { "label": 1, "confidence": 0.99 }
    }
  ]
}
```

</details>

<br/>

## 🗂 Project structure

```text
digit-recognizer/
├── app.py                 # Flask server and routes
├── fetch_mnist.py         # Downloads the MNIST dataset
├── train.py               # HOG extraction + KNN / SVM training
├── requirements.txt
├── models/                # Saved trained models
├── static/
│   ├── css/               # Responsive styles
│   └── js/                # Canvas drawing and UI logic (vanilla JS)
├── templates/             # Minimal and Detailed interfaces
└── docs/
    └── screenshots/       # README images
```

<br/>

## 🚧 Limitations

- 🔗 **Touching or overlapping digits** may be split incorrectly
- 🖋️ Models are trained on **MNIST**, so unusual handwriting styles can lower accuracy
- ➡️ Numbers are read **left to right on a single line**
- 🔢 Only the digits **0–9** are supported, not letters or symbols

<br/>

## 🧭 Roadmap

- [x] HOG feature extraction
- [x] KNN and SVM classifiers
- [x] Multi-digit recognition
- [x] Minimal and Detailed interfaces
- [ ] Compare against a small CNN
- [ ] Confusion matrix and per-digit accuracy in the Detailed view
- [ ] Better splitting for touching digits
- [ ] Docker image
- [ ] Hosted live demo

<br/>

## 🤝 Contributing

Ideas and pull requests are welcome. Open an issue first to discuss big changes.

## 📄 License

Released under the **MIT License**. See [`LICENSE`](LICENSE) for details.

---

<p align="center">
  <b>If this project helped you, consider giving it a ⭐</b>
  <br/><br/>
  <a href="#top">⬆ Back to top</a>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:00C6FF,50:4F46E5,100:F107A3&height=120&section=footer" alt="footer wave"/>
</p>
