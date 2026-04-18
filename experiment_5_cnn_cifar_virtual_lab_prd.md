# Product Requirements Document (PRD)

## Deep Learning Virtual Lab – Experiment 5

### Image Classification and Feature Extraction using Custom CNNs

### VESIT Virtual Lab Style UI & Simulation

### Vivekanand Education Society’s Institute of Technology
### Department of Computer Engineering

---

## 1. Document Overview

**Product Name:** Deep Learning Virtual Lab  
**Experiment ID:** Experiment 5  
**Title:** Image Classification and Feature Extraction using Custom CNNs  
**Institution Style Reference:** Vivekanand Education Society’s Institute of Technology (VESIT) – Department of Computer Engineering  
**UI Inspiration Reference:** IIT / IIIT Virtual Labs adapted for VESIT academic branding  
**Primary Users:** Undergraduate engineering students, faculty, lab instructors  
**Platform:** Web application (responsive desktop-first)

### Purpose
This PRD defines the functional, technical, pedagogical, and UI requirements for building an interactive virtual lab for multi-class image classification using a Convolutional Neural Network (CNN) trained on the CIFAR-10 dataset.

The platform replicates the **academic workflow of IIT VLab**:
- Aim
- Learning Outcomes
- Theory
- Procedure
- Simulation
- Observation
- Quiz
- References

---

## 2. Product Vision

Create a simulation-first educational platform where students can:
- Understand spatial pattern recognition using Convolutional layers.
- Configure CNN hyperparameters (Epochs, Batch Size, Learning Rate, Dropout).
- Run experiments interactively with real-time Server-Sent Events (SSE) streaming.
- Visualize intermediate hidden-layer Feature Maps to interpret model learning.
- Evaluate model biases using an interactive, color-coded Confusion Matrix.

---

## 3. Learning Objectives

After completing the lab, students should be able to:
- Contrast the spatial architectural advantages of CNNs over standard MLPs for 2D image data.
- Analyze the effects of advanced hyperparameters—specifically Dropout and Batch Normalization.
- Visualize and interpret intermediate feature extraction layers (filters, edges, textures).
- Evaluate model generalization dynamically using dual-axis live metric charts.

---

## 4. User Personas

- **Student:** Adjusts Dropout and Epochs, observes real-time loss/accuracy convergence, extracts feature maps, and interprets the confusion matrix.
- **Faculty:** Demonstrates the "Dead ReLU" phenomenon and Mode Collapse during live lectures.

---

## 5. Information Architecture (IIT VLab Style)

The experiment page follows this exact structure:

```text
Experiment 5
├── Aim
├── Learning Outcomes
├── Theory
├── Procedure
├── Simulation
├── Observation
├── Quiz
├── References
```

---

## 6. UI Requirements

### Page Layout

Two-column layout matching the VESIT global template.

```
----------------------------------------------------------
| Left Navigation        | Main Experiment Workspace        |
|------------------------|----------------------------------|
| Aim                    | Experiment Title                 |
| Learning Outcomes      | Hyperparameter Controls          |
| Theory                 | Live SSE Metrics Chart           |
| Procedure              | Feature Map Image Grid           |
| Simulation             | Confusion Matrix Heatmap         |
| Observation            |                                  |
| Quiz                   |                                  |
| References             |                                  |
 ----------------------------------------------------------
```

---

## 7. Functional Modules

### Module A: Thoery Section

Contains:
- The Convolutional Advantage (Spatial mapping vs Flattening)

- Batch Normalization & Pooling

- Dropout Regularization techniques

### Module B: Procedure Section

Step-wise workflow guiding the student through dataset preview, training initiation, feature extraction, and matrix generation.

### Module C: Simulation Section (Core)

This is the main interactive module.

**Parameter Control Panel:**

- **Epochs**: Slider (1 - 25)

- **Batch Size**: Dropdown (16, 32, 64, 128)

- **Learning Rate**: Dropdown (0.01, 0.001, 0.0001)

- **Dropout Rate**: Slider (0.0 - 0.6)

### Module D: Visualization Dashboard

1. **Dataset Preview**: Visualizes a random subset of CIFAR-10 RGB 32x32 images.

2. **Live Training Curve**: Real-time dual-axis Plotly chart streaming Loss (Red) and Accuracy (Green) via SSE.

3. **Feature Map Extractor**: A dynamically generated grid of 32 grayscale images representing the mathematical output of Conv2D Layer 1.

4. **Confusion Matrix**: A 10x10 interactive Plotly Heatmap with custom CIFAR-10 class labels and Blues colorscale.

### Module E: Interactive Quiz

A React-state-driven MCQ quiz evaluating the student's understanding of Max Pooling, Dropout, and matrix interpretation, with real-time score calculation.

---

## 8. Backend Requirements

### API Endpoints

1. **Stream Training Metrics**

    `POST /api/exp5/run-stream`

    - **Payload**: `{ epochs: 20, batch_size: 32, learning_rate: 0.001, dropout_rate: 0.25 }`

    - **Behavior**: Trains a custom CNN using `tf.GradientTape` and yields SSE chunks. Saves `exp5_trained_model.keras` to disk upon completion.

2. **Extract Feature Maps**

    `POST /api/exp5/extract-features`

    - **Behavior**: Loads the saved model, creates a partial extraction model, and returns an array of base64-encoded grayscale PNGs representing filter activations.

3. **Generate Confusion Matrix**

    `POST /api/exp5/confusion-matrix`

    - **Behavior**: Loads the saved model, predicts on a 1000-image test subset, and returns a 10x10 2D array.

---

## 9. Recommended Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Plotly.js (react-plotly.js).

- **Backend**: FastAPI (Python), TensorFlow/Keras, NumPy, Pillow, Python asyncio.

- **Data Pipeline**: tf.keras.datasets.cifar10 with subset slicing for browser performance.

---

## 10. Success Metrics

- Seamless real-time SSE chart rendering without browser lag.

- Meaningful divergence in the Confusion Matrix (diagonal formation) after 15+ epochs.

- Zero server crashes during concurrent partial model extractions.
