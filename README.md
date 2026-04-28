# Deep Learning Virtual Lab: MLP Image Classification

An academic-style virtual laboratory for exploring Multi-Layer Perceptrons (MLP) through image classification on the **MNIST Digits** and **Fashion-MNIST** datasets. This project adheres to the IIT/VESIT Virtual Lab UI pattern, providing a structured educational experience.

![VESIT Logo](frontend/public/vesit-logo.png)

## 🚀 Features

- **Dual Dataset Support**: Seamlessly switch between handwritten digits (MNIST) and clothing categories (Fashion-MNIST).
- **Real-time Simulation**: Watch the training process live with epoch-by-epoch loss and accuracy updates streamed via Server-Sent Events (SSE).
- **Interactive Hyperparameter Tuning**:
  - Hidden Layer Units (16 - 512)
  - Activation Functions (ReLU, Sigmoid, Tanh, Identity)
  - Optimizers (Adam, SGD, L-BFGS)
  - L2 Regularization (Alpha)
  - Learning Rate, Batch Size, and Epochs
- **Comprehensive Evaluation**:
  - Live Loss & Accuracy charts using Plotly.
  - Interactive Confusion Matrix with human-readable labels (e.g., "T-shirt", "Trouser").
  - Prediction Sandbox to visualize model performance on random test samples.
- **Academic Content**: Integrated sections for Aim, Theory, Procedure, Observation, Quiz, and References.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Plotly.js.
- **Backend**: FastAPI (Python), scikit-learn (MLPClassifier).
- **Data Pipeline**: Robust multi-stage loader (Pickle Cache -> Keras/OpenML Fallback).

## 📂 Project Structure

```text
.
├── backend/            # FastAPI Server & ML Logic
│   ├── main.py        # API Endpoints (SSE streaming)
│   ├── model.py       # MLP Training implementation
│   ├── data_loader.py # Dataset management & normalization
│   └── requirements.txt
├── frontend/           # Next.js Application
│   ├── src/
│   │   ├── app/       # Main lab page & layout
│   │   ├── components/# Simulation, Header, Sidebar
│   │   └── lib/       # API stream consumption
│   └── public/        # Assets (VESIT Logo)
├── data/               # Local dataset cache (.pkl files)
└── experiment_1_...md  # Project PRD & Requirements
```

## ⚙️ Setup & Installation

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the lab.

## 💡 Usage Guide

1. **Information Tabs**: Read through the **Aim** and **Theory** to understand the MLP architecture.
2. **Simulation**:
   - Select your **Dataset**.
   - Adjust hyperparameters in the sidebar.
   - Click **RUN SIMULATION**.
   - Monitor the **Training Console** and live charts.
3. **Analysis**:
   - Check the **Confusion Matrix** to see which classes the model confuses.
   - Test individual samples in the **Prediction Sandbox**.
4. **Assessment**: Take the **Quiz** to verify your understanding of the concepts.

## 🤝 Credits

Developed for the **Department of Computer Engineering, VESIT**. This lab follows the standard Virtual Lab guidelines to provide students with a high-fidelity learning environment for Deep Learning.

---
*Created for academic and research purposes.*
